import OpenAI from 'openai';
import { supabase } from '../lib/supabase';

/**
 * Text-generation model: GPT-6 Luna, OpenAI's most efficient model for focused,
 * high-volume tasks (https://developers.openai.com/api/docs/models).
 * Called via the Responses API with a reasoning effort; no temperature/top_p.
 */
export const AI_MODEL = 'gpt-6-luna';
const AI_REASONING_EFFORT = 'low' as const;

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export class AIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIConfigError';
  }
}

let cachedApiKey: string | null = null;
let pendingApiKey: Promise<string> | null = null;

/** Forget the cached key (e.g. after OpenAI rejects it, so a rotated key is refetched). */
export function clearOpenAIApiKeyCache() {
  cachedApiKey = null;
  pendingApiKey = null;
}

async function fetchOpenAIApiKey(): Promise<string> {
  const { data, error } = await supabase.rpc('get_openai_api_key');
  if (error) {
    throw new AIConfigError(
      // Signed-out callers get "permission denied" (anon has no EXECUTE grant);
      // signed-in callers without a uid get "Not authenticated".
      /not authenticated|permission denied|JWT/i.test(error.message)
        ? 'Please sign in to use AI features.'
        : `Could not load the AI API key from the server: ${error.message}`,
    );
  }
  const apiKey = typeof data === 'string' ? data.trim() : '';
  if (!apiKey) {
    throw new AIConfigError(
      "AI API key is not configured. Add the 'openai_api_key' row to the app_secrets table in Supabase.",
    );
  }
  if (__DEV__) {
    console.log(`[aiClient] OpenAI key loaded from Supabase (…${apiKey.slice(-4)})`);
  }
  return apiKey;
}

/** Fetch the OpenAI key from Supabase once per app session and cache it in memory. */
export async function getOpenAIApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;
  if (!pendingApiKey) {
    pendingApiKey = fetchOpenAIApiKey()
      .then(key => {
        cachedApiKey = key;
        return key;
      })
      .finally(() => {
        pendingApiKey = null;
      });
  }
  return pendingApiKey;
}

export async function createOpenAIClient(apiKey?: string) {
  return new OpenAI({
    apiKey: apiKey ?? (await getOpenAIApiKey()),
    dangerouslyAllowBrowser: true,
  });
}

function extractResponsesText(response: any): string {
  const direct = response?.output_text?.trim();
  if (direct) return direct;

  const output = response?.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const part of content) {
          const text = part?.text || part?.output_text;
          if (typeof text === 'string' && text.trim()) return text.trim();
        }
      }
      if (typeof item?.text === 'string' && item.text.trim()) return item.text.trim();
    }
  }
  return '';
}

function errorStatus(error: unknown): number | undefined {
  const anyErr = error as any;
  return anyErr?.status || anyErr?.response?.status;
}

function errorMessage(error: unknown): string {
  const anyErr = error as any;
  return (
    anyErr?.error?.message ||
    anyErr?.message ||
    (typeof anyErr === 'string' ? anyErr : 'Unknown AI error')
  );
}

function friendlyAIError(error: unknown): Error {
  const status = errorStatus(error);
  const message = errorMessage(error);
  const code = (error as any)?.code || (error as any)?.error?.code;

  if (status === 401 || /incorrect api key|invalid api key|authentication/i.test(message)) {
    clearOpenAIApiKeyCache();
    return new AIConfigError(
      "OpenAI rejected the API key. Update 'openai_api_key' in the Supabase app_secrets table with a valid key.",
    );
  }
  if (code === 'insufficient_quota' || /quota|billing/i.test(message)) {
    return new AIConfigError(
      'The OpenAI account has run out of credits. Add billing/credits at platform.openai.com and try again.',
    );
  }
  if (status === 429) {
    return new Error('AI rate limit reached. Please wait a moment and try again.');
  }
  if (status === 403) {
    return new AIConfigError(`This OpenAI key is not allowed to use the model: ${message}`);
  }
  if (status === 404 || /model/i.test(message)) {
    return new Error(`AI model unavailable: ${message}`);
  }
  return error instanceof Error ? error : new Error(String(message));
}

/** Generate text via the OpenAI Responses API using {@link AI_MODEL}. */
export async function generateAIText(messages: AIMessage[]): Promise<{ text: string; model: string }> {
  const client = await createOpenAIClient();
  try {
    const response = await client.responses.create({
      model: AI_MODEL,
      input: messages as any,
      reasoning: { effort: AI_REASONING_EFFORT },
    });
    const text = extractResponsesText(response);
    if (!text) {
      throw new Error('The AI returned an empty response. Please try again.');
    }
    return { text, model: AI_MODEL };
  } catch (error) {
    console.warn(`[aiClient] ${AI_MODEL} request failed:`, errorMessage(error));
    throw friendlyAIError(error);
  }
}
