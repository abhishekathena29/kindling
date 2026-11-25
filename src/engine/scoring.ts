import { AIPlan } from '../types/aiPlan';

import { ChildInfo } from '../types/childInfo';

export type ParentingStyle = 'Authoritative' | 'Authoritarian' | 'Permissive' | 'Neglectful' | 'Mixed';

export interface Question {
  id: string;
  category: 'A' | 'B' | 'C' | 'D'; // A: Authoritative, B: Authoritarian, C: Permissive, D: Uninvolved/Neglectful
  text: string;
}

export const QUESTIONS: Question[] = [
  { id: 'A1', category: 'A', text: 'I explain the reason behind rules instead of just enforcing them.' },
  { id: 'A2', category: 'A', text: 'I set clear expectations but allow discussion when my teen disagrees respectfully.' },
  { id: 'A3', category: 'A', text: 'When mistakes happen, I focus on learning rather than punishment or shame.' },
  { id: 'A4', category: 'A', text: 'I encourage independence while still maintaining boundaries.' },
  { id: 'A5', category: 'A', text: 'I regularly check in on my teen’s emotions and listen attentively.' },

  { id: 'B1', category: 'B', text: 'I expect immediate obedience when I give instructions.' },
  { id: 'B2', category: 'B', text: 'Rules are more important than my teen’s opinions.' },
  { id: 'B3', category: 'B', text: 'I use punishment to enforce discipline.' },
  { id: 'B4', category: 'B', text: 'Questioning rules feels like disrespect.' },
  { id: 'B5', category: 'B', text: 'I raise my voice or use threats when my teen resists.' },

  { id: 'C1', category: 'C', text: 'I avoid strict rules to prevent conflict.' },
  { id: 'C2', category: 'C', text: 'I often give in when my teen resists.' },
  { id: 'C3', category: 'C', text: 'I act more like a friend than a parent.' },
  { id: 'C4', category: 'C', text: 'My teen makes most decisions independently.' },
  { id: 'C5', category: 'C', text: 'I struggle to consistently enforce consequences.' },

  { id: 'D1', category: 'D', text: 'I am often too busy to notice my teen’s emotional state.' },
  { id: 'D2', category: 'D', text: 'I rarely track their routines or responsibilities.' },
  { id: 'D3', category: 'D', text: 'I don’t maintain clear expectations at home.' },
  { id: 'D4', category: 'D', text: 'I tend to avoid dealing with problems.' },
  { id: 'D5', category: 'D', text: 'I spend very little one-on-one time with my teen.' },
];

export const OPTIONS = [
  { value: 1, label: '1. Never' },
  { value: 2, label: '2. Rarely' },
  { value: 3, label: '3. Sometimes' },
  { value: 4, label: '4. Often' },
  { value: 5, label: '5. Always' },
];

export interface FinalOutput {
  dominantStyle: ParentingStyle | 'Mixed';
  scores: {
    Authoritative: number;
    Authoritarian: number;
    Permissive: number;
    Neglectful: number;
  };
  confidence: number;
  confidenceLevel: 'Low' | 'Moderate' | 'Strong';
  isMixed: boolean;
  mixedStyles: ParentingStyle[] | null;
  answers: Record<string, number>;
  createdAt?: string;
  aiPlan?: AIPlan | null;
  childInfo?: ChildInfo | null;
}

export function calculateScores(answers: Record<string, number>): FinalOutput {
  const getMean = (category: string) => {
    const subset = QUESTIONS.filter(q => q.category === category);
    const sum = subset.reduce((acc, q) => acc + (answers[q.id] || 0), 0);
    return sum / subset.length;
  };

  const scores = {
    Authoritative: getMean('A'),
    Authoritarian: getMean('B'),
    Permissive: getMean('C'),
    Neglectful: getMean('D'),
  };

  const sortedPairs = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topStyle = sortedPairs[0][0] as ParentingStyle;
  const secondStyle = sortedPairs[1][0] as ParentingStyle;

  const topScore = sortedPairs[0][1];
  const secondScore = sortedPairs[1][1];
  const confidence = topScore - secondScore;

  let confidenceLevel: 'Low' | 'Moderate' | 'Strong' = 'Strong';
  if (confidence <= 0.20) confidenceLevel = 'Low';
  else if (confidence <= 0.50) confidenceLevel = 'Moderate';
  else confidenceLevel = 'Strong';

  let dominantStyle = topStyle;
  let isMixed = false;
  let mixedStyles: ParentingStyle[] | null = null;

  if (confidence < 0.20) {
    dominantStyle = 'Mixed';
    isMixed = true;
    mixedStyles = [topStyle, secondStyle];
  }

  return {
    dominantStyle,
    scores,
    confidence,
    confidenceLevel,
    isMixed,
    mixedStyles,
    answers,
  };
}
