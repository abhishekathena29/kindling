import { ParentingStyle } from '../engine/scoring';

const buildSection = (title: string, bullets: string[]) => `${title}\n${bullets.map(item => `- ${item}`).join('\n')}`;

export const AGE_GUIDANCE: Record<ParentingStyle, Record<string, string>> = {
  Authoritative: {
    '5-10': buildSection('Early independence (5-10)', [
      'Reinforce consistent structure with explanation and emotion coaching.',
      'Combine routine-based activities with guided choice tasks and reflection prompts.',
      'Use positive reinforcement strategies to emphasise effort and moral reasoning.',
    ]),
    '10-13': buildSection('Guided autonomy (10-13)', [
      'Collaborate on decision-making, scaffolding responsibility gradually.',
      'Pair weekly planning sessions with problem-solving discussions and expectation tracking.',
      'Continue reasoning discipline so kids internalise rules while gaining independence.',
    ]),
    '13-15': buildSection('Balancing autonomy (13-15)', [
      'Support autonomy with open communication frameworks and negotiated boundaries.',
      'Use structured dialogue and decision evaluation prompts to explore consequences.',
      'Encourage perspective-taking while maintaining safety nets.',
    ]),
    '16-18': buildSection('Transition to adulthood (16-18)', [
      'Transfer responsibility gradually while keeping advisory support.',
      'Focus on future planning tasks (career, education) with reflective prompts.',
      'Maintain emotional support as they manage independent commitments.',
    ]),
  },
  Authoritarian: {
    '5-10': buildSection('Responsive control (5-10)', [
      'Introduce emotion coaching and explanatory rule-setting to complement structure.',
      'Bring positive reinforcement into the mix and add choice-within-structure tasks.',
      'Use emotion identification prompts to build confidence before correction.',
    ]),
    '10-13': buildSection('Guided thinking (10-13)', [
      'Create guided decision-making opportunities with partial collaboration.',
      'Shift from commands to joint planning, reflection, and hypothetical scenarios.',
      'Prompt the child to explain choices before intervening.',
    ]),
    '13-15': buildSection('Autonomy and dialogue (13-15)', [
      'Allow independent decisions on low-risk issues and support dialogue-based communication.',
      'Negotiate boundaries together and foster perspective-taking conversations.',
      'Use structured discussions to explore independence, expectations, and reasoning.',
    ]),
    '16-18': buildSection('Respectful transition (16-18)', [
      'Transfer responsibility gradually and adopt an advisory role.',
      'Encourage open-ended discussions to support critical thinking and self-reflection.',
      'Give practice with independent planning and future-oriented decisions.',
    ]),
  },
  Permissive: {
    '5-10': buildSection('Foundational structure (5-10)', [
      'Introduce routine establishment, simple rules, and immediate consequence mapping.',
      'Support “choose within limits” tasks plus daily responsibility prompts.',
      'Ask reflection questions that reinforce early moral reasoning.',
    ]),
    '10-13': buildSection('Pre-adolescent guidance (10-13)', [
      'Co-create expectations, allow structured independence, and assign planning tasks.',
      'Hold weekly planning sessions, scenario discussions, and responsibility checklists.',
      'Track progress with simple accountability tools.',
    ]),
    '13-15': buildSection('Accountability (13-15)', [
      'Set explicit expectations, consistent consequences, and autonomy linked to responsibility.',
      'Use goal–outcome tracking and boundary discussions to combat dysregulation.',
      'Prompt reflection on consequences to build accountability structures.',
    ]),
    '16-18': buildSection('Independent planning (16-18)', [
      'Encourage autonomous decisions with post-decision evaluation and future planning.',
      'Expose natural consequences safely and build independent task ownership.',
      'Support long-term planning through career/education mapping and reflective prompts.',
    ]),
  },
  Neglectful: {
    '5-10': buildSection('Emotional engagement (5-10)', [
      'Increase consistent, predictable interaction and routine implementation.',
      'Use emotion recognition and shared activity prompts to rebuild attachment.',
      'Ask daily check-ins like “How was your day?” to provide stability.',
    ]),
    '10-13': buildSection('Supportive involvement (10-13)', [
      'Create regular communication routines, active monitoring, and weekly check-ins.',
      'Plan joint activities and guided discussions about school and peers.',
      'Provide supportive feedback and encouragement.',
    ]),
    '13-15': buildSection('Relationship rebuilding (13-15)', [
      'Prioritise intentional relationship-building and non-judgmental communication.',
      'Reintroduce guidance with one-on-one sessions and interest-based engagement.',
      'Use open-ended prompts to understand what’s on their mind.',
    ]),
    '16-18': buildSection('Mentorship (16-18)', [
      'Adopt mentorship-style involvement and future-oriented planning discussions.',
      'Ensure consistent availability while guiding independent decision-making.',
      'Support reflective evaluation around next steps and practical tasks.',
    ]),
  },
  Mixed: {
    '5-10': buildSection('Consistency baseline (5-10)', [
      'Build stable daily routines while keeping emotional warmth high.',
    ]),
    '10-13': buildSection('Intentional guidance (10-13)', [
      'Focus on intentional responses rather than habitual default reactions.',
    ]),
    '13-15': buildSection('Balanced boundaries (13-15)', [
      'Maintain clear expectations with consistent dialogue and repair.',
    ]),
    '16-18': buildSection('Empathetic mentoring (16-18)', [
      'Support independent decisions with regular check-ins.',
    ]),
  },
};
