export interface AIPlanWeekItem {
  day: number;
  title: string;
  description: string;
  actions?: string[];
  time?: string;
  status?: 'done' | 'active' | 'upcoming';
  date?: string;
}

export interface AIPlan {
  parentingStyle: {
    dominant: string;
    confidenceLevel: string;
    styleNumber: number;
    mixedStyles?: string[];
  };
  scores: {
    Authoritative: number;
    Authoritarian: number;
    Permissive: number;
    Neglectful: number;
  };
  insights: {
    today: string;
    weekly: string;
  };
  plans: {
    today: {
      title: string;
      actions: string[];
    };
    week: AIPlanWeekItem[];
  };
  exercises: string[];
  personalityTraits: {
    type: string;
    number: number;
    growthEdge: string;
  };
  metadata: {
    generatedAt: string;
    model: string;
    structuredVersion: string;
  };
}

export interface AIPlanQuestionAnswer {
  id: string;
  text: string;
  value: number;
  label: string;
}

export interface MonthlyReflection {
  id?: string;
  userId?: string;
  periodLabel: string; // e.g. "August 2026"
  answers: {
    feedback?: string;
    win: string;
    challenge: string;
    focusGoal: string;
  };
  summary?: string;
  createdAt?: string;
}

export interface CalendarTaskItem {
  id: string;
  day: number;
  dateStr: string; // YYYY-MM-DD
  title: string;
  description: string;
  time: string;
  status: 'pending' | 'completed' | 'in_progress';
  type: 'challenge' | 'plan';
}
