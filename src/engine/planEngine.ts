import { FinalOutput } from './scoring';

export interface WeeklyChallenge {
  day: number;
  title: string;
  desc: string;
  time: string;
  status: 'upcoming' | 'active' | 'done';
}

export interface JourneyFocus {
  title: string;
  desc: string;
  bgColor: string;
  iconType: 'message' | 'shield' | 'heart' | 'trend' | 'target' | 'compass' | 'star' | 'sparkle';
}

export interface PersonalizedPlan {
  title: string;
  subtitle: string;
  analysisSummary: string;
  secondaryInsight: string;
  journeyFocuses: JourneyFocus[];
  weeklyChallenges: WeeklyChallenge[];
  communityQuotes: { initial: string; author: string; text: string; bgColor: string }[];
}

const STYLE_PLANS: Record<string, PersonalizedPlan> = {
  Authoritative: {
    title: 'Balanced & Thriving Parent',
    subtitle: 'Your warmth + structure is a powerful combination.',
    analysisSummary:
      "You show high responsiveness and consistent structure. Your teen likely feels both safe and respected. Your plan focuses on sustaining this balance under pressure and deepening emotional attunement.",
    secondaryInsight:
      "Research shows Authoritative parenting produces teens with higher self-esteem, better academic outcomes, and stronger peer relationships. Maintain the dialogue - it is working.",
    journeyFocuses: [
      { title: 'Deepen Emotional Attunement', desc: 'Go beyond daily check-ins - explore feelings behind behaviors', bgColor: '#FDECE1', iconType: 'heart' },
      { title: 'Sustain Under Pressure', desc: 'Keep calm, connected boundaries even during conflict spikes', bgColor: '#E4EDFA', iconType: 'shield' },
      { title: 'Collaborative Goal Setting', desc: 'Involve your teen in creating weekly family agreements', bgColor: '#E4F4ED', iconType: 'star' },
      { title: 'Growth Through Repair', desc: 'Model apology and repair after emotional moments', bgColor: '#EBE0F9', iconType: 'sparkle' },
    ],
    weeklyChallenges: [
      { day: 1, title: 'Emotion Mapping', desc: 'Ask your teen to name 3 emotions they felt today. Listen without shifting to advice.', time: '8 min', status: 'active' },
      { day: 2, title: 'Rule Co-Creation', desc: 'Revisit one existing house rule together - let your teen suggest an amendment.', time: '15 min', status: 'upcoming' },
      { day: 3, title: 'Strength Spotlight', desc: 'Name one specific strength you noticed in your teen this week and tell them directly.', time: '5 min', status: 'upcoming' },
      { day: 4, title: 'Repair Practice', desc: 'Recall a recent conflict. Send a small note, voice message or gesture of repair.', time: '10 min', status: 'upcoming' },
      { day: 5, title: 'Future Dream Talk', desc: 'Ask: If you could do anything after school, what would it be? Just listen and explore.', time: '20 min', status: 'upcoming' },
    ],
    communityQuotes: [
      { initial: 'R', author: 'Riya - Mother of 1', text: '"I thought I was already doing it right. The plan showed me I was skipping the repair step and that changed everything."', bgColor: '#FDECE1' },
      { initial: 'A', author: 'Arun - Father of 2', text: '"The collaborative goal-setting challenge was the turning point. My daughter now reminds me of our family agreements."', bgColor: '#E4EDFA' },
    ],
  },

  Authoritarian: {
    title: 'From Control to Connection',
    subtitle: 'Structure is your strength. Now add warmth.',
    analysisSummary:
      "Your scores show high demandingness but lower emotional responsiveness. Teens in high-control environments may comply outwardly but struggle with internal regulation. Your plan focuses on softening authority while maintaining structure.",
    secondaryInsight:
      "High control with low warmth can lead teens to hide struggles. The good news: adding small moments of warmth rapidly improves trust and reduces resistance. You do not have to give up your standards.",
    journeyFocuses: [
      { title: 'Soft Start Conversations', desc: 'Replace demands with curious questions to open dialogue', bgColor: '#FDECE1', iconType: 'message' },
      { title: 'Warmth Without Losing Authority', desc: 'Learn how to be firm AND empathetic in the same sentence', bgColor: '#E4F4ED', iconType: 'heart' },
      { title: 'Active Listening Practice', desc: "Pause instructions and hear your teen's perspective fully", bgColor: '#EBE0F9', iconType: 'trend' },
      { title: 'Celebrate Effort, Not Just Results', desc: 'Notice process and character, not only outcomes', bgColor: '#E4EDFA', iconType: 'star' },
    ],
    weeklyChallenges: [
      { day: 1, title: 'Listening Day', desc: 'Spend 10 minutes where your teen speaks and you only ask follow-up questions - no corrections.', time: '10 min', status: 'active' },
      { day: 2, title: 'Soften One Rule', desc: 'Pick one rigid rule and discuss with your teen what a fair version might look like.', time: '20 min', status: 'upcoming' },
      { day: 3, title: 'Acknowledge Feelings First', desc: 'Before reacting, say: I can see you are frustrated. Practice this in 3 interactions today.', time: '5 min', status: 'upcoming' },
      { day: 4, title: 'Catch Them Being Good', desc: 'Verbally praise your teen for a character trait today - not a chore, but a quality.', time: '2 min', status: 'upcoming' },
      { day: 5, title: 'Story Time', desc: 'Share a time you felt pressured growing up. Let your teen respond freely.', time: '15 min', status: 'upcoming' },
    ],
    communityQuotes: [
      { initial: 'M', author: 'Meena - Mother of 3', text: '"I grew up being disciplined strictly and thought that was the only way. This plan showed me I can keep standards and still connect."', bgColor: '#FCE7E4' },
      { initial: 'S', author: 'Suresh - Father of 2', text: '"The listening challenge was uncomfortable. But my son said it was the first time he felt I was not going to judge him."', bgColor: '#E4EDFA' },
    ],
  },

  Permissive: {
    title: 'Warmth with Guidance',
    subtitle: "Your love is real. Now let's build the structure to support it.",
    analysisSummary:
      "Your scores reveal strong emotional warmth and empathy but lower demandingness. Teens with permissive parents often feel loved but may lack the internal compass that comes from consistent expectations. Your plan focuses on adding gentle, loving structure.",
    secondaryInsight:
      "Permissive parents often avoid conflict out of love. But boundaries are acts of care - they signal that you believe your teen is capable of meeting standards. This week, practice holding one limit with full warmth.",
    journeyFocuses: [
      { title: 'Loving Limits', desc: 'Learn how to hold a boundary while staying emotionally connected', bgColor: '#E4EDFA', iconType: 'shield' },
      { title: 'Consistent Expectations', desc: 'Build one simple, clear routine and hold it for 7 days', bgColor: '#FDECE1', iconType: 'trend' },
      { title: 'Confident No Practice', desc: 'Say no with clarity and warmth - not guilt or apology', bgColor: '#FCE7E4', iconType: 'message' },
      { title: 'Natural Consequences', desc: 'Let small consequences teach, rather than rescuing immediately', bgColor: '#E4F4ED', iconType: 'sparkle' },
    ],
    weeklyChallenges: [
      { day: 1, title: 'One Non-Negotiable', desc: 'Identify and communicate one rule that will not change. Use a warm tone, firm position.', time: '10 min', status: 'active' },
      { day: 2, title: 'Let Consequences Land', desc: 'If your teen forgets homework - resist rescuing. Debrief together afterwards.', time: '5 min', status: 'upcoming' },
      { day: 3, title: 'Confident No', desc: 'When your teen asks for something off-plan, calmly say: Not today. I love you.', time: '2 min', status: 'upcoming' },
      { day: 4, title: 'Routine Kickoff', desc: 'Together, write a simple evening routine. Put it somewhere visible.', time: '15 min', status: 'upcoming' },
      { day: 5, title: 'Follow Through Day', desc: 'Pick one pending consequence or expectation and follow through today - with kindness.', time: '10 min', status: 'upcoming' },
    ],
    communityQuotes: [
      { initial: 'P', author: 'Priya - Mother of 2', text: '"I used to feel guilty about every rule. The plan helped me see limits as love. My daughter actually seems more settled."', bgColor: '#FDECE1' },
      { initial: 'N', author: 'Naveen - Father of 1', text: '"The confident no challenge was the hardest and most important. I finally stopped apologizing for having expectations."', bgColor: '#E4F4ED' },
    ],
  },

  Neglectful: {
    title: 'Reconnect and Re-Engage',
    subtitle: 'Presence is the most powerful gift you can give.',
    analysisSummary:
      "Your responses indicate limited engagement with your teen's emotional and structural needs. This is often linked to life overwhelm, burnout, or not knowing where to start - not a lack of love. Your plan begins gently: small, consistent moments of presence that rebuild trust.",
    secondaryInsight:
      "Reconnection does not require grand gestures. A 5-minute daily check-in done consistently is worth more than an occasional deep conversation. This plan starts small and builds momentum.",
    journeyFocuses: [
      { title: 'Daily 5-Minute Check-In', desc: 'Ask one open question each day and stay present for the answer', bgColor: '#FDECE1', iconType: 'heart' },
      { title: 'Know Their World', desc: 'Learn the names of 3 people or things that matter to your teen', bgColor: '#E4EDFA', iconType: 'sparkle' },
      { title: 'Shared Activity', desc: 'Do one thing your teen enjoys each week - even briefly', bgColor: '#E4F4ED', iconType: 'star' },
      { title: 'Basic Expectations', desc: 'Establish one simple home routine and maintain it', bgColor: '#EBE0F9', iconType: 'shield' },
    ],
    weeklyChallenges: [
      { day: 1, title: 'The 5-Minute Sit', desc: 'Sit with your teen for 5 minutes. No phone. Ask: What is one thing you are looking forward to?', time: '5 min', status: 'active' },
      { day: 2, title: 'Learn Their World', desc: 'Ask your teen to show you something they care about - music, game, video. Just watch and ask.', time: '10 min', status: 'upcoming' },
      { day: 3, title: 'Show Up for One Thing', desc: 'Attend or acknowledge one teen activity this week - even a small one.', time: '30 min', status: 'upcoming' },
      { day: 4, title: 'Phone-Free Dinner', desc: 'Spend one meal without phones. Ask one open question each.', time: '20 min', status: 'upcoming' },
      { day: 5, title: 'Appreciation Note', desc: 'Write or say: I notice [specific thing]. I am proud of you for that.', time: '3 min', status: 'upcoming' },
    ],
    communityQuotes: [
      { initial: 'D', author: 'Deepak - Father of 2', text: '"I was so burnt out I did not realise how checked out I had become. The 5-minute check-in felt small but my son started opening up."', bgColor: '#FCE7E4' },
      { initial: 'L', author: 'Lakshmi - Mother of 3', text: '"I did not know where to start. One small action a day - that is all it took to start feeling like a parent again."', bgColor: '#E4EDFA' },
    ],
  },

  Mixed: {
    title: 'Your Blended Parenting Journey',
    subtitle: "Flexibility is a strength. Let's build your baseline.",
    analysisSummary:
      "Your scores show a blended approach that shifts across different parenting dimensions. This flexibility can be adaptive, but inconsistency can leave teens unsure of what to expect. Your plan focuses on building a stable, intentional baseline across warmth and structure.",
    secondaryInsight:
      "Mixed styles often reflect a parent who is genuinely trying different approaches. The key is intentionality - choose your responses rather than react. Consistency in small things builds massive trust over time.",
    journeyFocuses: [
      { title: 'Building Your Parenting Identity', desc: 'Define 3 core values you want to guide your parenting this month', bgColor: '#EBE0F9', iconType: 'sparkle' },
      { title: 'Consistency in Small Things', desc: 'Pick one routine and hold it for 7 days without exception', bgColor: '#E4EDFA', iconType: 'shield' },
      { title: 'Intentional Warmth', desc: 'Plan one emotional connection moment each day - not reactive, but planned', bgColor: '#FDECE1', iconType: 'heart' },
      { title: 'Reflect and Adjust', desc: 'After each interaction, notice: was that the parent I want to be?', bgColor: '#E4F4ED', iconType: 'trend' },
    ],
    weeklyChallenges: [
      { day: 1, title: 'Values Reflection', desc: 'Write down 3 words that describe the parent you want to be. Read them each morning this week.', time: '10 min', status: 'active' },
      { day: 2, title: 'Spot Your Pattern', desc: 'Note 3 moments today where you were reactive. What triggered it?', time: '5 min', status: 'upcoming' },
      { day: 3, title: 'Planned Connection', desc: 'Schedule one 10-minute connection moment with your teen today - not spontaneous, intentional.', time: '10 min', status: 'upcoming' },
      { day: 4, title: 'Hold One Limit Warmly', desc: 'Say no to one request - with full warmth, no guilt, no anger.', time: '5 min', status: 'upcoming' },
      { day: 5, title: 'End-of-Week Reflection', desc: 'What went well this week? Write 2 things that felt like the parent you want to be.', time: '15 min', status: 'upcoming' },
    ],
    communityQuotes: [
      { initial: 'K', author: 'Kavita - Mother of 2', text: '"I kept flip-flopping and my daughters were confused. Setting my 3 values and sticking to them for one week changed everything."', bgColor: '#EBE0F9' },
      { initial: 'V', author: 'Vijay - Father of 1', text: '"The reflection challenge was eye-opening. I realised I was consistent in the wrong moments and absent in the right ones."', bgColor: '#FDECE1' },
    ],
  },
};

function getScoreRefinedInsight(results: FinalOutput): string {
  const { scores, dominantStyle } = results;
  const { Authoritative, Authoritarian, Permissive } = scores;

  if (dominantStyle === 'Authoritative') {
    if (Authoritarian > 3.5) return 'Your structure score is high - watch for moments where rules become more important than the relationship. Prioritize connection during conflict.';
    if (Permissive > 3.5) return 'Your warmth is exceptional. This week, practice holding one boundary without explanation - your teen needs to know limits exist even when you are both feeling good.';
    return 'You show a strong foundation. Focus this week on the small moments - the 2-minute check-ins that compound over time.';
  }
  if (dominantStyle === 'Authoritarian') {
    if (Authoritative > 3.0) return 'You are closer to balance than you think. Your Authoritative scores show genuine warmth - channel that consciously before setting instructions.';
    return 'Your scores show very high control. This week, experiment: give your teen one area where they have full decision-making power. Notice what changes.';
  }
  if (dominantStyle === 'Permissive') {
    if (Authoritative > 3.0) return 'You already have strong warmth skills. Adding one consistent expectation this week will feel different than you expect - try it and notice the response.';
    return 'Warmth and chaos can feel similar but lead to different outcomes. This week, pick one boundary and hold it through discomfort.';
  }
  if (dominantStyle === 'Neglectful') {
    if (Math.max(Authoritative, Permissive) > 2.5) return 'Parts of you want to connect - your scores show glimpses of warmth. Build on those moments this week. Start with 5 minutes.';
    return 'Starting here is already a step forward. One minute of full presence each day is your mission this week - nothing more.';
  }
  if (dominantStyle === 'Mixed') {
    const topTwo = (Object.entries(scores) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 2);
    return `Your responses blend ${topTwo[0][0]} and ${topTwo[1][0]} tendencies with close scores. Focus this week on being intentional - choose your style for each interaction rather than defaulting to habit.`;
  }
  return 'Each quiz session reveals new patterns. Use this week\'s challenges to build intentional habits.';
}

export function generatePersonalizedPlan(results: FinalOutput): PersonalizedPlan & { scoreRefinedInsight: string } {
  const style = results.dominantStyle as keyof typeof STYLE_PLANS;
  const basePlan = STYLE_PLANS[style] || STYLE_PLANS['Mixed'];
  return {
    ...basePlan,
    scoreRefinedInsight: getScoreRefinedInsight(results),
  };
}
