import { FinalOutput, QUESTIONS, OPTIONS, ParentingStyle } from '../engine/scoring';
import { AIPlan, AIPlanQuestionAnswer, AIPlanWeekItem } from '../types/aiPlan';
import { ChildInfo } from '../types/childInfo';
import { AGE_GUIDANCE } from '../data/ageGuidance';
import { generateAIText } from './aiClient';

const MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are Kindling AI, a warm, research-informed parenting companion. Your task is to read the parent’s assessment data, apply the Kindling frameworks, and return one structured JSON payload exactly matching the schema described below. Under no circumstances add extra text outside the JSON object. Use empathetic, evidence-based language that references the parent’s dominant style and the Kindling research context.`;

const KINDLING_CONTEXT = `Kindling – Parent Channel Architecture
1. Emotional & Mental Well-Being
Core focus: helping parents read emotions, respond empathetically, and support adolescent mental health.
Mood Swing Central
 Understanding teen emotional volatility, silence, and outbursts

Worth Beyond Comparison
 Navigating self-worth in the age of peers, cousins, and influencers

2. Education, Pressure & Performance
Core focus: Balancing ambition, expectations, and mental health.
Burnout Before Boards
 Emotional exhaustion in high-achieving teens
Career Maze
 Stream selection, career confusion, and “what next?” conversations

3. Digital Life & Tech Challenges
Core focus: managing technology without eroding trust or connection.
Scroll Patrol
 Screen time, phone addiction, and daily tech conflicts

Online, Not Alone?
 Social media, validation, and teen self-esteem

Digital Footprints
 Online safety, privacy, and boundaries

4. Family Structures & Distance
Core focus: emotional continuity across non-traditional family setups.
Miles Apart, Hearts Connected
 Parenting when children live away from home, or parents are frequently traveling or away from home

Two Homes, One Teen
 Co-parenting and dual-household dynamics

5. Cultural, Social & Generational Gaps
Core focus: navigating values, expectations, and identity across generations.
Back in Our Day…
 Generational disconnects and evolving norms, plus the social pressure shaping parenting choices 
Raising Kids Without a Village
 Parenting without extended family support

6. Social Life & Belonging
Core focus: friendships, identity, and peer relationships.
Friends, Fallouts & FOMO
 Navigating shifting social circles, Fear of missing out and comparison culture

Bullies, Banter & Boundaries
 Understanding social harm and assertiveness

7. Talking About Dating (Without Panic)
Core focus: trust-based conversations around relationships.
Let’s Talk (No Panic Mode)
 How to start conversations about dating

Guidance Over Ground Rules
 Setting boundaries without pushing teens away

The Four Parenting Styles (Detailed): Kindling Literature Review and Conceptual Framework 
Foundational Theory
The concept of parenting styles originates from Diana Baumrind’s seminal work (1960s–1970s) and was later expanded by Maccoby & Martin (1983). Parenting styles are classified based on two core psychological dimensions:
Responsiveness (Warmth)
 The degree to which parents are emotionally supportive, empathetic, communicative, and attuned to a child’s needs.
Demandingness (Control)
 The extent to which parents set expectations, enforce rules, monitor behavior, and provide structure.

These two dimensions form a 2×2 matrix, yielding four parenting styles that have been empirically validated across cultures, age groups, and developmental outcomes.
1. Authoritative Parenting
High Responsiveness + High Demandingness
Core Characteristics
Parents set clear expectations and boundaries
Rules are explained and discussed, not imposed blindly
Emphasis on reasoning, dialogue, and mutual respect
Emotional warmth coexists with structure
Parents remain flexible to context and child’s emotional state

Developmental Outcomes (Research-Backed)
Higher self-esteem and emotional regulation
Better academic performance
Stronger parent-child attachment
Lower rates of anxiety and rebellion

How Literature Describes It
Considered the most adaptive and optimal style
Encourages autonomy while maintaining accountability
Central to secure attachment formation

Implication for ML (Kindling)
Use collaborative, reflective prompts
Encourage joint problem-solving
Reinforce strengths while suggesting balanced boundaries

2. Authoritarian Parenting
Low Responsiveness + High Demandingness
Core Characteristics
Strict rules with little explanation
Emphasis on obedience and authority
Discipline is often punitive
Emotional expression and dissent are discouraged
Parent-child communication is largely one-directional

Developmental Outcomes
Short-term compliance
Higher levels of anxiety, fear-based behavior
Lower emotional expression and autonomy
Increased risk of rebellion or emotional withdrawal in adolescence

How Literature Describes It
Control-driven rather than guidance-driven
Emotional needs are subordinated to discipline
Associated with external regulation rather than self-regulation

Implication for ML
Avoid confrontational or corrective tones
Gradually introduce empathy-based prompts
Normalize emotional dialogue and reflective listening

3. Permissive Parenting
High Responsiveness + Low Demandingness
Core Characteristics
High emotional warmth and acceptance
Few rules or inconsistent enforcement
Parents often avoid conflict
Child autonomy prioritized over structure
Consequences are minimal or inconsistently applied

Developmental Outcomes
High self-expression
Lower self-discipline and impulse control
Difficulty with authority, boundaries, and delayed gratification
Academic inconsistency

How Literature Describes It
Parent acts more like a friend than a guide
Emotional closeness without scaffolding
Linked to underdeveloped self-regulation

Implication for ML
Introduce boundary-setting gently
Reinforce consistency without guilt framing
Emphasize structure as emotional safety

4. Uninvolved / Neglectful Parenting
Low Responsiveness + Low Demandingness
(Added later in literature; covered in IJEDR 2017 and adolescent mental health studies)
Core Characteristics
Minimal emotional engagement
Low monitoring or guidance
Parent is often physically or emotionally unavailable
May stem from stress, work overload, mental health, or lack of awareness

Developmental Outcomes
Highest risk category
Emotional neglect, low self-worth
Poor academic and social outcomes
Increased vulnerability to anxiety, depression, and risky behaviors

How Literature Describes It
Absence of both structure and warmth
Often unintentional, driven by external stressors
Strongly correlated with adolescent emotional distress

Implication for ML
Increase frequency of gentle nudges
Focus on micro-interactions (small wins)
Emphasize presence, awareness, and emotional check-ins

Kindling Questionnaire 
Parenting style research commonly clusters parenting into patterns defined by (1) responsiveness/warmth and (2) demandingness/control. Tools like the Parental Authority Questionnaire (PAQ) and Parenting Styles and Dimensions Questionnaire (PSDQ) operationalize these patterns via items about rule-setting, reasoning, autonomy, punishment, and emotional attunement. In Baumrind-style models:
Authoritative = high warmth + high structure (reasoning + boundaries)

Authoritarian = low warmth + high control (obedience + punishment)

Permissive = high warmth + low structure (few limits)

Uninvolved/Neglectful = low warmth + low structure (low engagement)

Response format (use this)
Likert 1–5: 1 Never, 2 Rarely, 3 Sometimes, 4 Often, 5 Always
Answer based on your typical behavior with your teen (10–17).
20 survey questions (5 per style)
A) Authoritative (Warm + Structured)
A1. I explain the reason behind the rules (not just “because I said so”).
 A2. I set clear expectations, and I’m open to discussion if my teen disagrees respectfully.
 A3. When my teen messes up, we focus on learning and consequences—not shame.
 A4. I encourage independence while still setting boundaries.
 A5. I regularly check in on feelings (stress, friendships, mood) and listen fully.
B) Authoritarian (Strict + Low Dialogue)
B1. I expect immediate obedience when I give an instruction.
 B2. I believe strict rules matter more than my teen’s opinion in family decisions.
 B3. I use punishment to enforce compliance (even if my teen doesn’t understand why).
 B4. If my teen questions a rule, I see it as disrespectful.
 B5. I raise my voice or use threats when my teen won’t cooperate.
C) Permissive (Warm + Low Boundaries)
C1. I avoid setting firm rules because I don’t want conflict.
 C2. If my teen strongly resists, I often give in to keep peace.
 C3. I prefer being a friend to my teen rather than enforcing discipline.
 C4. My teen decides most things (sleep, screen time, study routine) with minimal limits.
 C5. Even when rules exist, I don’t consistently follow through on consequences.
D) Uninvolved/Neglectful (Low Warmth + Low Structure)
D1. I’m often too busy/tired to notice my teen’s emotional state.
 D2. I rarely track school deadlines, friendships, or daily routines.
 D3. I don’t have clear expectations about behavior at home.
 D4. When problems come up, I tend to disengage rather than address them.
 D5. I spend very little one-on-one time talking or doing activities with my teen.

Scoring metrics (simple + ML-friendly)
Step 1: Compute subscale scores
Authoritative Score (AUTHO) = mean(A1–A5)

Authoritarian Score (AUTHN) = mean(B1–B5)

Permissive Score (PERM) = mean(C1–C5)

Uninvolved Score (UNINV) = mean(D1–D5)

(Use means so it stays on a 1–5 scale.)
Step 2: Assign parenting style label
Predicted Parenting Style = highest subscale score

Step 3: Confidence score (recommended)
Confidence = (TopScore – SecondTopScore)
 Interpretation:

0.00–0.20 = low confidence / mixed style

0.21–0.50 = moderate

0.51+ = strong

Step 4: Edge cases / tie-break
If difference < 0.20, label as “Mixed” and store the top two styles (e.g., Authoritative–Permissive). This is useful for ML training and avoids forcing noisy labels.
Scale Structure
Likert-type scales (typically 1–5 or 1–7)
Responses reflect frequency or agreement
Styles are dimensional, not binary
 → Parents may score high on more than one style

Important Insight for ML
Parenting styles are:
Continuous, not categorical
Context-sensitive (stress, work, child age)
Often blended, with one dominant style

Kindling should therefore:
Identify primary + secondary style
Track shifts over time
Adapt tone dynamically rather than labeling rigidly
Why This Matters for Kindling’s ML System
This framework allows the model to:
Interpret parent behavior without judgment
Predict emotional communication patterns
Adjust prompt tone, timing, and framing
Detect risk zones (e.g., high uninvolved + adolescent stress)

Some research paper references to put in the training model
https://www.academia.edu/16837246/Parental_Authority_Questionnaire
https://www.rjwave.org/ijedr/papers/IJEDR1703064.pdf
https://www.researchgate.net/publication/284239814_The_Parenting_Styles_and_Dimensions_Questionnaire_PSDQ
`;

const SCHEMA_INSTRUCTION = `Respond only with JSON that matches this schema exactly (you may include optional fields but keep their structure consistent):
{
  "parentingStyle": {
    "dominant": "Authoritative",
    "confidenceLevel": "Moderate",
    "styleNumber": 3.4,
    "mixedStyles": ["Authoritative", "Permissive"]
  },
  "scores": {
    "Authoritative": 4.2,
    "Authoritarian": 2.5,
    "Permissive": 3.1,
    "Neglectful": 1.7
  },
  "insights": {
    "today": "Your calm tone is working…",
    "weekly": "Hold one boundary…"
  },
  "plans": {
    "today": {
      "title": "Repair and Reconnect",
      "actions": ["Send a short voice note…", "Spend 3 minutes…"]
    },
    "week": [
      {
        "day": 1,
        "title": "Emotion Mapping",
        "description": "Name three emotions…",
        "actions": ["Deep listening prompt"],
        "time": "10 min",
        "status": "done"
      },
      ...
    ]
  },
  "exercises": ["Pause before replying…", "Plan one gratitude lunch."],
  "personalityTraits": {
    "type": "Empathetic Reformer",
    "number": 4.2,
    "growthEdge": "Give yourself permission…"
  },
  "metadata": {
    "generatedAt": "2026-04-09T04:00:00Z",
    "model": "gpt-5.4",
    "structuredVersion": "1.0"
  }
}
Include a status ("done", "active", "upcoming") and estimate a time commitment for each weekly item. Make sure the JSON is well-formed, uses double quotes, and is the only text in your response.`;

const buildQuestionAnswers = (answers: Record<string, number>): AIPlanQuestionAnswer[] =>
  QUESTIONS.map(question => {
    const value = answers[question.id] ?? 1;
    const label = OPTIONS.find(option => option.value === value)?.label || `${value}`;
    return {
      id: question.id,
      text: question.text,
      value,
      label,
    };
  });

const extractJson = (text: string) => {
  const start = text.indexOf('{');
  if (start === -1) {
    throw new Error('Unable to locate JSON object in the Kindling AI response.');
  }
  // Ignore any prose / code fences after the closing brace.
  const end = text.lastIndexOf('}');
  const trimmed = end > start ? text.slice(start, end + 1) : text.slice(start);
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error('Kindling AI response could not be parsed as JSON.');
  }
};

const ensureMetadata = (plan: AIPlan) => {
  const metadata = {
    generatedAt: plan.metadata?.generatedAt || new Date().toISOString(),
    model: plan.metadata?.model || MODEL,
    structuredVersion: plan.metadata?.structuredVersion || '1.0',
  };
  return { ...plan, metadata };
};

const buildAgeContext = (childInfo?: ChildInfo) => {
  if (!childInfo?.ageGroups?.length) return '';
  const sections = childInfo.ageGroups.map(ageRange => {
    const entries: string[] = [];
    (Object.keys(AGE_GUIDANCE) as ParentingStyle[]).forEach(style => {
      const guidance = AGE_GUIDANCE[style][ageRange];
      if (guidance) {
        entries.push(`${style} (${ageRange}):\\n${guidance}`);
      }
    });
    return entries.length ? `Age group ${ageRange} context:\\n${entries.join('\\n\\n')}` : '';
  });
  return sections.filter(Boolean).join('\\n\\n');
};

export interface AIPlanResponsePayload {
  plan: AIPlan;
  prompt: string;
  questionAnswers: AIPlanQuestionAnswer[];
  childInfo?: ChildInfo;
}

export async function generateAIPlan(
  answers: Record<string, number>,
  results: FinalOutput,
  childInfo?: ChildInfo,
): Promise<AIPlanResponsePayload> {
  const questionAnswers = buildQuestionAnswers(answers);
  const scoreLines = Object.entries(results.scores)
    .map(([style, score]) => `${style}: ${score.toFixed(1)}`)
    .join(', ');

  const mixedPair = results.mixedStyles ? `Top mix: ${results.mixedStyles.join(' + ')}` : '';
  const childSummary = childInfo
    ? `Child count: ${childInfo.count}.${childInfo.ageGroups.length ? ` Age groups: ${childInfo.ageGroups.join(', ')}.` : ''}`
    : 'Child information not provided.';
  const ageContext = buildAgeContext(childInfo);

  const userPrompt = `${KINDLING_CONTEXT}

Assessment summary:
- Dominant style: ${results.dominantStyle}
- Confidence level: ${results.confidenceLevel}
- Confidence diff: ${results.confidence.toFixed(2)}
- Top scores: ${scoreLines}
${mixedPair ? `- Mixed styles: ${mixedPair}\n` : ''}

Responses:
${questionAnswers
    .map(entry => `${entry.id}: ${entry.text} → ${entry.label}`)
    .join('\n')}

${childSummary}
${ageContext ? `${ageContext}\n` : ''}
${SCHEMA_INSTRUCTION}`;

  const { text: rawText, model } = await generateAIText([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ]);

  const plan = ensureMetadata({
    ...extractJson(rawText),
    metadata: {
      generatedAt: new Date().toISOString(),
      model,
      structuredVersion: '1.0',
    },
  });

  return {
    plan,
    prompt: userPrompt,
    questionAnswers,
    childInfo,
  };
}

export async function generateNextWeekTasksFromReflection(
  results: FinalOutput,
  reflection: { feedback?: string; win: string; challenge: string; focusGoal: string },
): Promise<AIPlanWeekItem[]> {
  try {
    const prompt = `You are Kindling AI. Regenerate the next week's personalized parenting plan based on:
1. Initial Assessment Baseline:
   - Dominant Parenting Style: ${results.dominantStyle} (Confidence: ${results.confidenceLevel})
   - Style Scores: ${JSON.stringify(results.scores)}
2. Parent's Reflection & Task Feedback:
   - Feedback on Previous Tasks: "${reflection.feedback || 'Tasks were generally helpful.'}"
   - Parenting Win: "${reflection.win}"
   - Main Challenge/Conflict: "${reflection.challenge}"
   - Next Week Focus Goal: "${reflection.focusGoal}"

Generate 5 daily challenges/tasks for the brand new week plan. Respond ONLY with a valid JSON array of 5 objects matching this schema:
[
  {
    "day": 1,
    "title": "Short Task Title",
    "description": "Clear actionable daily task taking into account their feedback and focus goal",
    "actions": ["Step 1", "Step 2"],
    "time": "10 min",
    "status": "upcoming"
  }
]`;
      const { text: raw } = await generateAIText([{ role: 'user', content: prompt }]);
      if (raw) {
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start !== -1 && end > start) {
          const parsed = JSON.parse(raw.slice(start, end + 1));
          if (Array.isArray(parsed) && parsed.length >= 5) {
            return parsed.slice(0, 5);
          }
        }
      }
    } catch (e) {
      console.warn('AI task generation error, falling back to local engine', e);
    }

  // Fallback generation based on focus goal, task feedback, and assessment style
  const goalStr = reflection.focusGoal.trim() || 'Parenting Connection';
  return [
    {
      day: 1,
      title: `${goalStr.slice(0, 25)} - Kickoff`,
      description: `Based on your feedback: "${reflection.feedback || 'Continuing progress'}". Focus on your goal: "${reflection.focusGoal || 'Strengthening bond'}". Take 10 mins for an intentional conversation with your teen.`,
      actions: ['Ask open-ended question', 'Listen without interrupting'],
      time: '10 min',
      status: 'active',
    },
    {
      day: 2,
      title: 'Empathy & Validation',
      description: `Reflecting on "${reflection.challenge || 'recent challenge'}": Practice validating your teen's feelings before offering advice.`,
      actions: ['Acknowledge emotion first'],
      time: '15 min',
      status: 'upcoming',
    },
    {
      day: 3,
      title: 'Celebrate Small Wins',
      description: `Building on "${reflection.win || 'your recent win'}": Share positive appreciation directly with your teen today.`,
      actions: ['Give specific praise'],
      time: '5 min',
      status: 'upcoming',
    },
    {
      day: 4,
      title: 'Boundary Check-in',
      description: 'Review home expectations with warmth and clear communication.',
      actions: ['State limit with empathy'],
      time: '10 min',
      status: 'upcoming',
    },
    {
      day: 5,
      title: 'Reflection & Repair',
      description: 'Spend 5 minutes reflecting on your interactions this week and practice a repair gesture if needed.',
      actions: ['Reflect on tone', 'Connect with teen'],
      time: '10 min',
      status: 'upcoming',
    },
  ];
}

