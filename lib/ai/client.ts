import OpenAI, { AzureOpenAI } from 'openai';

/**
 * Centralised AI client factory.
 *
 * Supports two providers:
 *   1. Azure OpenAI (default, recommended) — data stays in your Azure region,
 *      never retained or used for training.
 *   2. OpenAI direct — fallback if Azure env vars are not set.
 *
 * Required env vars for Azure:
 *   AZURE_OPENAI_API_KEY      — API key from your Azure OpenAI resource
 *   AZURE_OPENAI_ENDPOINT     — e.g. https://your-resource.openai.azure.com
 *   AZURE_OPENAI_DEPLOYMENT   — deployment name for GPT-4o (e.g. "gpt-4o")
 *   AZURE_OPENAI_DALLE_DEPLOYMENT — deployment name for DALL-E 3 (e.g. "dall-e-3")
 *   AZURE_OPENAI_API_VERSION  — e.g. "2024-10-21"
 *
 * Fallback env vars (OpenAI direct):
 *   OPENAI_API_KEY
 */

const isAzure = Boolean(
  process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT,
);

function createClient(): OpenAI {
  if (isAzure) {
    return new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-10-21',
    });
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    organization: process.env.OPENAI_ORG_ID || undefined,
  });
}

/** The shared AI client instance. */
export const aiClient = createClient();

/** The chat model deployment/model name to use. */
export const CHAT_MODEL = isAzure
  ? (process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o')
  : 'gpt-4o';

/** The image model deployment/model name to use. */
export const IMAGE_MODEL = isAzure
  ? (process.env.AZURE_OPENAI_DALLE_DEPLOYMENT || 'dall-e-3')
  : 'dall-e-3';

/** Whether Azure OpenAI is active (for logging / disclosure). */
export const AI_PROVIDER = isAzure ? 'azure' as const : 'openai' as const;

/** Returns true if AI is configured (either provider). */
export function isAIConfigured(): boolean {
  if (isAzure) return true;
  return Boolean(
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
  );
}
