import { generateAIText, AIMessage } from './aiClient';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are Kindling AI, a warm and knowledgeable parenting companion assistant built into the Kindling app. 
Your role is to provide supportive, evidence-based parenting guidance tailored to each parent's unique journey.

Guidelines:
- Always be warm, empathetic, and non-judgmental
- Give practical, actionable advice
- Keep responses concise (2-4 sentences) unless more detail is truly needed
- Format replies in simple Markdown so they read well on a phone: short paragraphs, **bold** for key ideas, and "-" bullet or "1." numbered lists for steps or options. Use a "###" heading only for longer answers. Do not use tables, code blocks, or HTML.
- Focus on emotional connection, child development, and positive parenting strategies
- If a user shares their parenting style (Authoritative, Permissive, etc.), personalize your response to that style
- Never give medical advice — suggest consulting a pediatrician for health concerns`;

/**
 * Send a chat message to OpenAI and receive a string reply.
 */
export async function sendChatMessage(
  conversationHistory: OpenAIMessage[],
  userMessage: string,
  parentingStyle?: string | null,
  language: 'en' | 'hi' = 'en',
): Promise<string> {
  let systemContent = SYSTEM_PROMPT;
  if (language === 'hi') {
    systemContent += '\n\nThe parent is using the app in Hindi. Always reply in natural, simple Hindi (Devanagari script), keeping the same Markdown formatting.';
  }
  if (parentingStyle) {
    systemContent += `\n\nContext: This parent's dominant parenting style is "${parentingStyle}". Tailor your advice accordingly.`;
  }

  const messages: AIMessage[] = [
    { role: 'system', content: systemContent },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const { text } = await generateAIText(messages);
  return text;
}
