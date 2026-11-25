import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FinalOutput } from '../engine/scoring';
import { generatePersonalizedPlan } from '../engine/planEngine';
import { RecommendedResource, getRandomRecommendations } from '../lib/resources';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { PlanCardData } from '../components/PlanCardModal';
import { MessageCircle, BookOpen, Heart } from 'lucide-react-native';
export interface ConnectivityState {
  isConnected: boolean;
  isInternetReachable?: boolean;
}
import { AIPlan, MonthlyReflection } from '../types/aiPlan';
import { AIPlanResponsePayload, generateNextWeekTasksFromReflection } from '../services/aiPlanService';

const STREAK_LAST_LOGIN_KEY = '@kindling:last_login_date';

const toDateKey = (date = new Date()) => date.toISOString().split('T')[0];

const daysBetweenKeys = (earlier: string, later: string) => {
  const a = new Date(`${earlier}T00:00:00Z`).getTime();
  const b = new Date(`${later}T00:00:00Z`).getTime();
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
};

interface ProgressSnapshot {
  completedChallenges: number;
  totalChallenges: number;
  streakDays: number;
  weeksActive: number;
}

interface StoredPlanCard {
  id: string;
  title: string;
  description: string;
  icon: 'MessageCircle' | 'BookOpen' | 'Heart';
  iconBg: string;
  steps: string[];
  status: 'pending' | 'completed' | 'in_progress';
}

interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface ChannelRecord {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface ChannelMessage {
  id: string;
  channelId: string;
  authorId: string;
  body: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

interface AppContextType {
  assessmentHistory: FinalOutput[];
  addAssessmentResult: (result: FinalOutput, planPayload?: AIPlanResponsePayload) => Promise<void>;
  weeklyTasks: PlanCardData[];
  notifications: NotificationRecord[];
  channels: ChannelRecord[];
  channelMessages: Record<string, ChannelMessage[]>;
  progressSnapshot: ProgressSnapshot;
  loadChannelMessages: (channelId: string) => Promise<void>;
  sendChannelMessage: (channelId: string, text: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  ensureAuthorNames: (ids: string[]) => Promise<void>;
  isAIModalVisible: boolean;
  setAIModalVisible: (visible: boolean) => void;
  aiDraftMessage: string;
  setAIDraftMessage: (message: string) => void;
  showNotifications: boolean;
  setShowNotifications: (visible: boolean) => void;
  isAIFabHidden: boolean;
  setAIFabHidden: (hidden: boolean) => void;
  currentRecommendations: RecommendedResource[];
  updateWeeklyTaskStatus: (taskIdOrTitle: string, status: StoredPlanCard['status']) => Promise<void>;
  toggleWeeklyTaskStatus: (taskIdOrTitle: string) => Promise<void>;
  monthlyReflections: MonthlyReflection[];
  saveMonthlyReflection: (answers: { feedback?: string; win: string; challenge: string; focusGoal: string }) => Promise<void>;
  isReflectionModalVisible: boolean;
  setReflectionModalVisible: (visible: boolean) => void;
  isCalendarModalVisible: boolean;
  setCalendarModalVisible: (visible: boolean) => void;
  isOnline: boolean;
  connectivityMessage: string | null;
  authorNames: Record<string, string>;
  refreshChannels: () => Promise<void>;
  latestAIPlan: AIPlan | null;
  hasCompletedAssessment: boolean;
  /** False until the signed-in user's assessments have been fetched once. */
  isAssessmentHistoryLoaded: boolean;
}

interface AIPlanSessionRow {
  assessment_id: string;
  response: AIPlan;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ICON_LOOKUP: Record<StoredPlanCard['icon'], PlanCardData['Icon']> = {
  MessageCircle,
  BookOpen,
  Heart,
};

const resolvePlanCards = (stored: StoredPlanCard[]): PlanCardData[] =>
  stored.map(card => ({
    id: card.id,
    title: card.title,
    description: card.description,
    iconBg: card.iconBg,
    Icon: ICON_LOOKUP[card.icon],
    steps: card.steps,
    status: card.status,
  }));

const WEEK_TASK_COLORS = ['#E4F4ED', '#FDECE1', '#E4EDFA', '#EBE0F9'];
const WEEK_TASK_ICONS: StoredPlanCard['icon'][] = ['MessageCircle', 'BookOpen', 'Heart'];

const mapAIPlanToStoredTasks = (plan: AIPlan): StoredPlanCard[] =>
  plan.plans.week.map((item, index) => ({
    id: `ai-plan-${item.day ?? index + 1}-${item.title}`,
    title: item.title,
    description: item.description,
    icon: WEEK_TASK_ICONS[index % WEEK_TASK_ICONS.length],
    iconBg: WEEK_TASK_COLORS[index % WEEK_TASK_COLORS.length],
    steps: item.actions && item.actions.length > 0 ? item.actions : [item.description],
    // Always start fresh — completion is tracked only via user toggles.
    status: index === 0 ? ('in_progress' as const) : ('pending' as const),
  }));

const mapStaticPlanToStoredTasks = (results: FinalOutput): StoredPlanCard[] => {
  const plan = generatePersonalizedPlan(results);
  return plan.weeklyChallenges.map((item, index) => ({
    id: `static-plan-${item.day ?? index + 1}-${item.title}`,
    title: item.title,
    description: item.desc,
    icon: WEEK_TASK_ICONS[index % WEEK_TASK_ICONS.length],
    iconBg: WEEK_TASK_COLORS[index % WEEK_TASK_COLORS.length],
    steps: [item.desc],
    status: index === 0 ? ('in_progress' as const) : ('pending' as const),
  }));
};

const normalizeActiveChallenge = (tasks: StoredPlanCard[]): StoredPlanCard[] => {
  let activated = false;
  return tasks.map(task => {
    if (task.status === 'completed') return task;
    if (!activated) {
      activated = true;
      return { ...task, status: 'in_progress' as const };
    }
    return { ...task, status: 'pending' as const };
  });
};

const applyLocalProgress = (
  prev: ProgressSnapshot,
  tasks: StoredPlanCard[],
): ProgressSnapshot => {
  const { completed, total } = deriveWeeklyProgress(tasks);
  return {
    completedChallenges: completed,
    totalChallenges: total,
    // Streak is updated separately via daily login activity.
    streakDays: prev.streakDays,
    weeksActive: Math.max(prev.weeksActive, tasks.length > 0 ? 1 : 0),
  };
};

const defaultProgress: ProgressSnapshot = {
  completedChallenges: 0,
  totalChallenges: 5,
  streakDays: 0,
  weeksActive: 0,
};

const getWeekStartDate = (date: Date) => {
  const copy = new Date(date);
  const weekday = copy.getDay();
  const diff = (weekday + 6) % 7; // monday start
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const deriveWeeklyProgress = (tasks: StoredPlanCard[]) => {
  const completed = tasks.filter(task => task.status === 'completed').length;
  const total = Math.max(defaultProgress.totalChallenges, tasks.length);
  return { completed, total };
};

interface AppProviderProps {
  children: React.ReactNode;
  connectivity?: ConnectivityState;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [assessmentHistory, setAssessmentHistory] = useState<FinalOutput[]>([]);
  const [storedWeeklyTasks, setStoredWeeklyTasks] = useState<StoredPlanCard[]>([]);
  const storedWeeklyTasksRef = useRef<StoredPlanCard[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<PlanCardData[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [channels, setChannels] = useState<ChannelRecord[]>([]);
  const [channelMessages, setChannelMessages] = useState<Record<string, ChannelMessage[]>>({});
  const [progressSnapshot, setProgressSnapshot] = useState<ProgressSnapshot>(defaultProgress);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const authorNamesRef = useRef<Record<string, string>>({});
  const [isAIModalVisible, setAIModalVisible] = useState(false);
  const [aiDraftMessage, setAIDraftMessage] = useState('');
  const [latestAIPlan, setLatestAIPlan] = useState<AIPlan | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAIFabHidden, setAIFabHidden] = useState(false);
  const [currentRecommendations, setCurrentRecommendations] = useState<RecommendedResource[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [monthlyReflections, setMonthlyReflections] = useState<MonthlyReflection[]>([]);
  const [isReflectionModalVisible, setReflectionModalVisible] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [isAssessmentHistoryLoaded, setAssessmentHistoryLoaded] = useState(false);
  const hasCompletedAssessment = assessmentHistory.length > 0;

  const syncProgressSnapshotFromWeeklyTasks = useCallback(
    async (userId: string, tasks: StoredPlanCard[]) => {
      setProgressSnapshot(prev => applyLocalProgress(prev, tasks));

      const { completed, total } = deriveWeeklyProgress(tasks);
      const weekStart = getWeekStartDate(new Date()).toISOString().split('T')[0];
      try {
        const { data, error } = await supabase
          .from('progress_snapshots')
          .select('id, weeks_active, streak_days')
          .eq('user_id', userId)
          .eq('week_start', weekStart)
          .maybeSingle();
        if (error) {
          console.warn('Unable to sync progress snapshot', error);
          return;
        }
        const weeksActive = Math.max(data?.weeks_active ?? 0, tasks.length > 0 ? 1 : 0);
        // Preserve streak from daily-login tracking; do not inflate on each challenge toggle.
        const streakDays = data?.streak_days ?? 0;

        const payload = {
          completed_challenges: completed,
          total_challenges: total,
          weeks_active: weeksActive,
          streak_days: streakDays,
          updated_at: new Date().toISOString(),
        };

        if (!data?.id) {
          const { error: insertError } = await supabase.from('progress_snapshots').insert({
            user_id: userId,
            week_start: weekStart,
            ...payload,
          });
          if (insertError) {
            console.warn('Unable to insert progress snapshot', insertError);
          }
        } else {
          const { error: updateError } = await supabase
            .from('progress_snapshots')
            .update(payload)
            .eq('id', data.id);
          if (updateError) {
            console.warn('Unable to update progress snapshot', updateError);
          }
        }

        setProgressSnapshot(prev => ({
          ...prev,
          completedChallenges: completed,
          totalChallenges: total,
          weeksActive,
          streakDays: Math.max(prev.streakDays, streakDays),
        }));
      } catch (error) {
        console.warn('Unable to sync progress snapshot', error);
      }
    },
    [],
  );

  const recordDailyLogin = useCallback(async (userId: string) => {
    try {
      const todayKey = toDateKey();

      // Prefer Supabase last_login_date; AsyncStorage is a same-device fast path.
      const cached = await AsyncStorage.getItem(STREAK_LAST_LOGIN_KEY);
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_login_date')
        .eq('id', userId)
        .maybeSingle();

      const lastKey = profile?.last_login_date || cached;
      if (lastKey === todayKey) {
        if (cached !== todayKey) {
          await AsyncStorage.setItem(STREAK_LAST_LOGIN_KEY, todayKey);
        }
        return;
      }

      const weekStart = getWeekStartDate(new Date()).toISOString().split('T')[0];
      const { data } = await supabase
        .from('progress_snapshots')
        .select('id, streak_days, weeks_active')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .maybeSingle();

      let nextStreak = 1;
      if (lastKey) {
        const gap = daysBetweenKeys(String(lastKey), todayKey);
        if (gap === 1) {
          nextStreak = Math.max(1, (data?.streak_days ?? 0) + 1);
        } else if (gap === 0) {
          nextStreak = Math.max(1, data?.streak_days ?? 1);
        } else {
          nextStreak = 1;
        }
      } else if ((data?.streak_days ?? 0) > 0) {
        nextStreak = data!.streak_days;
      }

      const weeksActive = Math.max(data?.weeks_active ?? 0, 1);
      if (!data?.id) {
        const { error: insertError } = await supabase.from('progress_snapshots').insert({
          user_id: userId,
          week_start: weekStart,
          completed_challenges: 0,
          total_challenges: 5,
          streak_days: nextStreak,
          weeks_active: weeksActive,
        });
        if (insertError) {
          console.warn('Unable to insert progress snapshot for streak', insertError);
        }
      } else {
        const { error: updateError } = await supabase
          .from('progress_snapshots')
          .update({
            streak_days: nextStreak,
            weeks_active: weeksActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        if (updateError) {
          console.warn('Unable to update streak on progress snapshot', updateError);
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ last_login_date: todayKey })
        .eq('id', userId);
      if (profileError) {
        // Column may not exist until migration 10 is applied — still keep local cache.
        console.warn('Unable to update profiles.last_login_date (run migration 10?)', profileError);
      }

      await AsyncStorage.setItem(STREAK_LAST_LOGIN_KEY, todayKey);
      setProgressSnapshot(prev => ({
        ...prev,
        streakDays: nextStreak,
        weeksActive: Math.max(prev.weeksActive, weeksActive),
      }));
    } catch (error) {
      console.warn('Unable to record daily login streak', error);
    }
  }, []);

  const loadAssessments = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        console.warn('Unable to load assessments', error);
        return;
      }

      const { data: planData } = await supabase
        .from('ai_plan_sessions')
        .select('assessment_id, response')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const sessionMap = new Map<string, AIPlan>();
      (planData ?? []).forEach((session: AIPlanSessionRow) => {
        if (session.assessment_id && session.response) {
          sessionMap.set(session.assessment_id, session.response);
        }
      });

      const normalized = (data ?? []).map(item => ({
        dominantStyle: item.dominant_style as FinalOutput['dominantStyle'],
        scores: item.scores,
        confidence: parseFloat(item.confidence),
        confidenceLevel: item.confidence_level,
        isMixed: item.is_mixed,
        mixedStyles: item.mixed_styles ?? null,
        answers: item.answers,
        createdAt: item.created_at,
        childInfo: item.child_info ?? null,
        aiPlan: sessionMap.get(item.id) ?? null,
      }));

      setAssessmentHistory(normalized);
      setLatestAIPlan(normalized[0]?.aiPlan ?? null);
    } catch (error) {
      console.warn('Unable to load assessments', error);
    } finally {
      // Mark loaded even on failure so the UI never waits forever.
      setAssessmentHistoryLoaded(true);
    }
  }, []);

  const checkConnectivity = useCallback(async () => {
    // Ping our own backend (any HTTP response means we're online). Google's
    // generate_204 can be blocked on some networks and a short timeout caused
    // false "offline" banners on cold start.
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        fetch(`${SUPABASE_URL}/auth/v1/health`, {
          method: 'GET',
          headers: { apikey: SUPABASE_ANON_KEY },
        }),
        new Promise((_resolve, reject) => {
          timeoutId = setTimeout(() => reject(new Error('timeout')), 10000);
        }),
      ]);
      return true;
    } catch {
      return false;
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let consecutiveFailures = 0;
    const runCheck = async () => {
      const ok = await checkConnectivity();
      consecutiveFailures = ok ? 0 : consecutiveFailures + 1;
      // Require two failed checks in a row before showing the offline banner.
      const online = consecutiveFailures < 2;
      if (isMounted) {
        setIsOnline(online);
      }
    };
    runCheck();
    const interval = setInterval(runCheck, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [checkConnectivity]);

  const connectivityMessage = isOnline
    ? null
    : 'Internet connection required to sync your latest community data. Please reconnect.';

  const persistWeeklyTasks = useCallback(async (tasks: StoredPlanCard[]) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const weekStart = getWeekStartDate(new Date()).toISOString().split('T')[0];
      const { error } = await supabase
        .from('weekly_tasks')
        .upsert(
          {
            user_id: user.id,
            week_start: weekStart,
            tasks,
          },
          { onConflict: 'user_id,week_start' },
        );
      if (error) {
        console.warn('Unable to persist weekly tasks', error);
      }
    } catch (error) {
      console.warn('Unable to persist weekly tasks', error);
    }
  }, []);

  const setWeeklyTaskState = useCallback((tasks: StoredPlanCard[]) => {
    storedWeeklyTasksRef.current = tasks;
    setStoredWeeklyTasks(tasks);
    setWeeklyTasks(resolvePlanCards(tasks));
  }, []);

  const applyAIPlanToWeeklyTasks = useCallback(
    async (plan: AIPlan) => {
      const mapped = mapAIPlanToStoredTasks(plan);
      setWeeklyTaskState(mapped);
      await persistWeeklyTasks(mapped);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id) {
          await syncProgressSnapshotFromWeeklyTasks(user.id, mapped);
        }
      } catch {
        // best effort
      }
    },
    [persistWeeklyTasks, setWeeklyTaskState, syncProgressSnapshotFromWeeklyTasks],
  );

  const buildWeekTasksFromLatestAssessment = useCallback((): StoredPlanCard[] => {
    const latest = assessmentHistory[0];
    if (!latest) return [];
    if (latestAIPlan?.plans?.week?.length) {
      return mapAIPlanToStoredTasks(latestAIPlan);
    }
    if (latest.aiPlan?.plans?.week?.length) {
      return mapAIPlanToStoredTasks(latest.aiPlan);
    }
    return mapStaticPlanToStoredTasks(latest);
  }, [assessmentHistory, latestAIPlan]);

  const updateWeeklyTaskStatus = useCallback(
    async (taskIdOrTitle: string, status: StoredPlanCard['status']) => {
      const current = storedWeeklyTasksRef.current;
      const normalizedQuery = taskIdOrTitle.trim().toLowerCase();

      // Always work against a full week list so Home/Profile/Assessment stay aligned.
      let base = current;
      if (base.length === 0) {
        base = buildWeekTasksFromLatestAssessment();
      }

      let found = false;
      let updated = base.map(task => {
        if (task.id === taskIdOrTitle || task.title.trim().toLowerCase() === normalizedQuery) {
          found = true;
          return { ...task, status };
        }
        return task;
      });

      if (!found && base.length > 0) {
        // Title mismatch — append only as last resort, keep the rest of the week.
        updated = [
          ...base,
          {
            id: `challenge-${Date.now()}`,
            title: taskIdOrTitle.replace(/^ai-plan-\d+-/, '').replace(/^static-plan-\d+-/, ''),
            description: 'Challenge',
            icon: 'MessageCircle' as const,
            iconBg: '#E4F4ED',
            steps: [],
            status,
          },
        ];
      } else if (!found) {
        updated = [
          {
            id: `challenge-${Date.now()}`,
            title: taskIdOrTitle,
            description: 'Challenge',
            icon: 'MessageCircle' as const,
            iconBg: '#E4F4ED',
            steps: [],
            status,
          },
        ];
      }

      updated = normalizeActiveChallenge(updated);
      setWeeklyTaskState(updated);
      setProgressSnapshot(prev => applyLocalProgress(prev, updated));

      await persistWeeklyTasks(updated);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id) {
          await syncProgressSnapshotFromWeeklyTasks(user.id, updated);
        }
      } catch {
        // best effort — local state already updated
      }
    },
    [
      buildWeekTasksFromLatestAssessment,
      persistWeeklyTasks,
      setWeeklyTaskState,
      syncProgressSnapshotFromWeeklyTasks,
    ],
  );

  const toggleWeeklyTaskStatus = useCallback(
    async (taskIdOrTitle: string) => {
      const normalizedQuery = taskIdOrTitle.trim().toLowerCase();
      const currentTask = storedWeeklyTasksRef.current.find(
        t => t.id === taskIdOrTitle || t.title.trim().toLowerCase() === normalizedQuery
      );
      const nextStatus: StoredPlanCard['status'] =
        currentTask?.status === 'completed' ? 'pending' : 'completed';
      await updateWeeklyTaskStatus(taskIdOrTitle, nextStatus);
    },
    [updateWeeklyTaskStatus],
  );

  const loadMonthlyReflections = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('monthly_reflections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setMonthlyReflections(
          data.map(item => ({
            id: item.id,
            userId: item.user_id,
            periodLabel: item.period_label,
            answers: item.answers,
            summary: item.summary,
            createdAt: item.created_at,
          }))
        );
      }
    } catch (e) {
      console.warn('Unable to load monthly reflections', e);
    }
  }, []);

  const saveMonthlyReflection = useCallback(
    async (answers: { feedback?: string; win: string; challenge: string; focusGoal: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please sign in to save your reflection.');
      }
      const periodLabel = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const { data, error } = await supabase
        .from('monthly_reflections')
        .insert({
          user_id: user.id,
          period_label: periodLabel,
          answers,
          summary: `Focus goal: ${answers.focusGoal}`,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Unable to save reflection.');
      }

      const newReflection: MonthlyReflection = {
        id: data.id,
        userId: data.user_id,
        periodLabel: data.period_label,
        answers: data.answers,
        summary: data.summary,
        createdAt: data.created_at,
      };
      setMonthlyReflections(prev => [newReflection, ...prev]);

      if (assessmentHistory.length > 0) {
        const newWeekItems = await generateNextWeekTasksFromReflection(assessmentHistory[0], answers);
        const mappedStored: StoredPlanCard[] = newWeekItems.map((item, index) => ({
          id: `ai-plan-ref-${Date.now()}-${item.day ?? index + 1}-${item.title}`,
          title: item.title,
          description: item.description,
          icon: WEEK_TASK_ICONS[index % WEEK_TASK_ICONS.length],
          iconBg: WEEK_TASK_COLORS[index % WEEK_TASK_COLORS.length],
          steps: item.actions && item.actions.length > 0 ? item.actions : [item.description],
          status:
            item.status === 'done'
              ? ('completed' as const)
              : item.status === 'active'
              ? ('in_progress' as const)
              : ('pending' as const),
        }));
        setWeeklyTaskState(mappedStored);
        await persistWeeklyTasks(mappedStored);
        await syncProgressSnapshotFromWeeklyTasks(user.id, mappedStored);

        setAssessmentHistory(prev => {
          if (prev.length === 0) return prev;
          const [latest, ...rest] = prev;
          const basePlan = latest.aiPlan;
          const updatedPlan: AIPlan = {
            parentingStyle: basePlan?.parentingStyle ?? {
              dominant: String(latest.dominantStyle),
              confidenceLevel: latest.confidenceLevel,
              styleNumber:
                latest.dominantStyle === 'Mixed'
                  ? 0
                  : latest.scores[latest.dominantStyle] ?? 0,
            },
            scores: basePlan?.scores ?? {
              Authoritative: latest.scores.Authoritative,
              Authoritarian: latest.scores.Authoritarian,
              Permissive: latest.scores.Permissive,
              Neglectful: latest.scores.Neglectful,
            },
            insights: {
              today: basePlan?.insights.today ?? 'Keep showing up with small, consistent moments.',
              weekly: `Next focus: ${answers.focusGoal}`,
            },
            plans: {
              today: basePlan?.plans.today ?? {
                title: 'Start with connection',
                actions: newWeekItems[0]?.actions ?? [newWeekItems[0]?.description ?? 'Check in with your teen'],
              },
              week: newWeekItems,
            },
            exercises: basePlan?.exercises ?? [],
            personalityTraits: basePlan?.personalityTraits ?? {
              type: 'Growing Parent',
              number: 0,
              growthEdge: answers.focusGoal,
            },
            metadata: {
              generatedAt: new Date().toISOString(),
              model: basePlan?.metadata.model ?? 'local-fallback',
              structuredVersion: basePlan?.metadata.structuredVersion ?? '1.0',
            },
          };
          setLatestAIPlan(updatedPlan);
          return [{ ...latest, aiPlan: updatedPlan }, ...rest];
        });
      }
    },
    [assessmentHistory, persistWeeklyTasks, setWeeklyTaskState, syncProgressSnapshotFromWeeklyTasks],
  );


  const loadWeeklyTasks = useCallback(async (userId: string) => {
    const weekStart = getWeekStartDate(new Date()).toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('weekly_tasks')
      .select('tasks')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle();
    if (error) {
      console.warn('Unable to load weekly tasks', error);
      return;
    }
    const stored: StoredPlanCard[] = data?.tasks ?? [];
    if (!data) {
      await supabase.from('weekly_tasks').insert({
        user_id: userId,
        week_start: weekStart,
        tasks: [],
      });
    }
    setWeeklyTaskState(stored);
    await syncProgressSnapshotFromWeeklyTasks(userId, stored);

    // Existing assessment with empty weekly_tasks (common after AI fallback): seed static challenges.
    if (stored.length === 0) {
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      const latest = assessments?.[0];
      if (latest) {
        const result: FinalOutput = {
          dominantStyle: latest.dominant_style,
          scores: latest.scores,
          confidence: parseFloat(latest.confidence),
          confidenceLevel: latest.confidence_level,
          isMixed: latest.is_mixed,
          mixedStyles: latest.mixed_styles ?? null,
          answers: latest.answers,
          createdAt: latest.created_at,
          childInfo: latest.child_info ?? null,
        };
        const mapped = mapStaticPlanToStoredTasks(result);
        setWeeklyTaskState(mapped);
        await persistWeeklyTasks(mapped);
        await syncProgressSnapshotFromWeeklyTasks(userId, mapped);
      }
    }
  }, [persistWeeklyTasks, setWeeklyTaskState, syncProgressSnapshotFromWeeklyTasks]);

  const loadNotifications = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Unable to load notifications', error);
      return;
    }
    const normalized = (data ?? []).map(item => ({
      id: item.id,
      title: item.title,
      body: item.body,
      read: item.read,
      createdAt: item.created_at,
    }));
    setNotifications(normalized);
  }, []);

  const loadChannels = useCallback(async () => {
    const { data, error } = await supabase
      .from('channels')
      .select('id, name, description, category, icon_name')
      .eq('is_public', true)
      .order('name', { ascending: true });
    if (error) {
      console.warn('Unable to load channels', error);
      return;
    }
    const normalized = (data ?? []).map(channel => ({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      category: channel.category,
    }));
    setChannels(normalized);
  }, []);

  const refreshChannels = useCallback(async () => {
    await loadChannels();
  }, [loadChannels]);

  const loadProgressSnapshot = useCallback(async (userId: string) => {
    const weekStart = getWeekStartDate(new Date()).toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('progress_snapshots')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle();
    if (error) {
      console.warn('Unable to load progress snapshot', error);
      return;
    }
    const derivedFromTasks = deriveWeeklyProgress(storedWeeklyTasksRef.current);
    if (!data) {
      await supabase.from('progress_snapshots').insert({
        user_id: userId,
        week_start: weekStart,
        completed_challenges: derivedFromTasks.completed,
        total_challenges: derivedFromTasks.total,
      });
      setProgressSnapshot(prev => ({
        ...defaultProgress,
        completedChallenges: derivedFromTasks.completed,
        totalChallenges: derivedFromTasks.total,
        streakDays: prev.streakDays,
        weeksActive: Math.max(prev.weeksActive, storedWeeklyTasksRef.current.length > 0 ? 1 : 0),
      }));
      return;
    }
    setProgressSnapshot({
      // Task list is always the source of truth for challenge counts.
      completedChallenges: derivedFromTasks.completed,
      totalChallenges: Math.max(derivedFromTasks.total, data.total_challenges ?? 5),
      streakDays: data.streak_days ?? 0,
      weeksActive: Math.max(data.weeks_active ?? 0, storedWeeklyTasksRef.current.length > 0 ? 1 : 0),
    });
  }, []);

  const persistAssessmentResult = useCallback(async (result: FinalOutput, planPayload?: AIPlanResponsePayload) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: inserted, error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          dominant_style: result.dominantStyle,
          scores: result.scores,
          confidence: result.confidence,
          confidence_level: result.confidenceLevel,
          is_mixed: result.isMixed,
          mixed_styles: result.mixedStyles,
          answers: result.answers,
          child_info: result.childInfo,
        })
        .select('id')
        .single();
      if (error) {
        console.warn('Unable to persist assessment', error);
        return;
      }
      if (planPayload?.plan && inserted?.id) {
        const { error: sessionError } = await supabase.from('ai_plan_sessions').insert({
          user_id: user.id,
          assessment_id: inserted.id,
          prompt: planPayload.prompt,
          question_answers: planPayload.questionAnswers,
          response: planPayload.plan,
        });
        if (sessionError) {
          console.warn('Unable to persist AI plan session', sessionError);
        }
      }
    } catch (error) {
      console.warn('Unable to persist assessment', error);
    }
  }, []);

  const ensureAuthorNames = useCallback(async (ids: string[]) => {
    const missing = ids.filter(id => id && !authorNamesRef.current[id]);
    if (missing.length === 0) {
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', missing);
      if (error) {
        console.warn('Unable to load author names', error);
        return;
      }
      setAuthorNames(prev => {
        const updated = { ...prev };
        (data ?? []).forEach(profile => {
          if (profile?.id && profile?.name) {
            updated[profile.id] = profile.name;
          }
        });
        authorNamesRef.current = updated;
        return updated;
      });
    } catch (error) {
      console.warn('Unable to load author names', error);
    }
  }, []);

  const loadChannelMessages = useCallback(async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('channel_messages')
        .select('id, channel_id, author_id, body, created_at, metadata')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
      if (error) {
        console.warn('Unable to load channel messages', error);
        return;
      }
      const normalized = (data ?? []).map(item => ({
        id: item.id,
        channelId: item.channel_id,
        authorId: item.author_id,
        body: item.body,
        createdAt: item.created_at,
        metadata: item.metadata,
      }));
      const authorIds = Array.from(new Set(normalized.map(msg => msg.authorId).filter(Boolean)));
      await ensureAuthorNames(authorIds);
      setChannelMessages(prev => ({
        ...prev,
        [channelId]: normalized,
      }));
    } catch (error) {
      console.warn('Unable to load channel messages', error);
    }
  }, [ensureAuthorNames]);

  const sendChannelMessage = useCallback(async (channelId: string, text: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('channel_messages')
        .insert({
          channel_id: channelId,
          author_id: user.id,
          body: text,
        })
        .select('id, channel_id, author_id, body, created_at, metadata')
        .single();
      if (error) {
        console.warn('Unable to send channel message', error);
        return;
      }
      const normalized = {
        id: data.id,
        channelId: data.channel_id,
        authorId: data.author_id,
        body: data.body,
        createdAt: data.created_at,
        metadata: data.metadata,
      };
      setChannelMessages(prev => ({
        ...prev,
        [channelId]: [...(prev[channelId] ?? []), normalized],
      }));
    } catch (error) {
      console.warn('Unable to send channel message', error);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) {
        console.warn('Unable to mark notification read', error);
        return;
      }
      setNotifications(prev => prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification,
      ));
    } catch (error) {
      console.warn('Unable to mark notification read', error);
    }
  }, []);


  useEffect(() => {
    setCurrentRecommendations(getRandomRecommendations());
  }, []);

	  useEffect(() => {
	    const refreshUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAssessmentHistory([]);
        setAssessmentHistoryLoaded(false);
        storedWeeklyTasksRef.current = [];
        setStoredWeeklyTasks([]);
        setWeeklyTasks([]);
        setProgressSnapshot(defaultProgress);
        setChannels([]);
        setNotifications([]);
        setChannelMessages({});
        setLatestAIPlan(null);
        setAIDraftMessage('');
        return;
      }
	      await Promise.all([
	        loadAssessments(user.id),
	        loadNotifications(user.id),
	        loadChannels(),
	        loadMonthlyReflections(user.id),
	      ]);
	      await loadWeeklyTasks(user.id);
	      await loadProgressSnapshot(user.id);
	      await recordDailyLogin(user.id);
	    };

	    refreshUserData();
	    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id;
	      if (!uid) {
        setAssessmentHistory([]);
        setAssessmentHistoryLoaded(false);
        storedWeeklyTasksRef.current = [];
        setStoredWeeklyTasks([]);
        setWeeklyTasks([]);
        setProgressSnapshot(defaultProgress);
        setChannels([]);
        setNotifications([]);
        setChannelMessages({});
	        setLatestAIPlan(null);
	        setAIDraftMessage('');
          setMonthlyReflections([]);
	        return;
	      }
	      loadAssessments(uid);
	      loadNotifications(uid);
	      loadChannels();
        loadMonthlyReflections(uid);
	      loadWeeklyTasks(uid).then(() =>
        loadProgressSnapshot(uid).then(() => recordDailyLogin(uid)),
      );
	    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [loadAssessments, loadNotifications, loadWeeklyTasks, loadProgressSnapshot, loadChannels, loadMonthlyReflections, recordDailyLogin]);

  const addAssessmentResult = useCallback(
    async (result: FinalOutput, planPayload?: AIPlanResponsePayload) => {
      setAssessmentHistory(prev => [result, ...prev]);
      if (planPayload?.plan) {
        setLatestAIPlan(planPayload.plan);
        await applyAIPlanToWeeklyTasks(planPayload.plan);
      } else if (result.aiPlan) {
        setLatestAIPlan(result.aiPlan);
        await applyAIPlanToWeeklyTasks(result.aiPlan);
      } else if (storedWeeklyTasksRef.current.length === 0) {
        // Static plan fallback — seed the same challenges Profile/Home track.
        const mapped = mapStaticPlanToStoredTasks(result);
        setWeeklyTaskState(mapped);
        await persistWeeklyTasks(mapped);
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user?.id) {
            await syncProgressSnapshotFromWeeklyTasks(user.id, mapped);
          }
        } catch {
          // best effort
        }
      }
      await persistAssessmentResult(result, planPayload);
    },
    [applyAIPlanToWeeklyTasks, persistAssessmentResult, persistWeeklyTasks, setWeeklyTaskState, syncProgressSnapshotFromWeeklyTasks],
  );

  // Always derive challenge counts from live weekly tasks so Profile/Home/Assessment
  // never diverge from each other.
  const progressSnapshotForUI = useMemo(() => {
    if (storedWeeklyTasks.length === 0) {
      return {
        ...progressSnapshot,
        completedChallenges: 0,
        totalChallenges: Math.max(progressSnapshot.totalChallenges, 5),
      };
    }
    const { completed, total } = deriveWeeklyProgress(storedWeeklyTasks);
    return {
      ...progressSnapshot,
      completedChallenges: completed,
      totalChallenges: total,
      weeksActive: Math.max(progressSnapshot.weeksActive, 1),
      streakDays: progressSnapshot.streakDays,
    };
  }, [storedWeeklyTasks, progressSnapshot]);

  return (
      <AppContext.Provider
        value={{
          assessmentHistory,
          addAssessmentResult,
          weeklyTasks,
          progressSnapshot: progressSnapshotForUI,
          updateWeeklyTaskStatus,
          toggleWeeklyTaskStatus,
          monthlyReflections,
          saveMonthlyReflection,
          isReflectionModalVisible,
          setReflectionModalVisible,
          isCalendarModalVisible,
          setCalendarModalVisible,
          isAIModalVisible,
          setAIModalVisible,
          aiDraftMessage,
          setAIDraftMessage,
          showNotifications,
          setShowNotifications,
          isAIFabHidden,
          setAIFabHidden,
          currentRecommendations,
          notifications,
          channels,
          channelMessages,
          loadChannelMessages,
          sendChannelMessage,
          markNotificationRead,
          ensureAuthorNames,
          refreshChannels,
          isOnline,
          connectivityMessage,
          authorNames,
          latestAIPlan,
          hasCompletedAssessment,
          isAssessmentHistoryLoaded,
        }}
      >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
