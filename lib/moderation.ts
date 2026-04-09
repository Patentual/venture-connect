import OpenAI from 'openai';

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  flaggedCategories?: string[];
}

// Keyword-based fallback (catches obvious cases even without OpenAI key)
const BLOCKED_PATTERNS = [
  /\b(porn|xxx|onlyfans|sex\s*tape|nudes?|hentai)\b/i,
  /\b(n[i1]gg[ea]r|f[a@]gg?[o0]t|k[i1]ke|sp[i1]c|ch[i1]nk|w[e3]tb[a@]ck)\b/i,
  /\b(kill\s+(yourself|urself|them|him|her)|kys)\b/i,
  /\b(cp\b|child\s*porn|p[e3]do|paed)/i,
];

function keywordCheck(text: string): ModerationResult {
  const lower = text.toLowerCase();
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        allowed: false,
        reason: 'Content contains prohibited language.',
        flaggedCategories: ['keyword_filter'],
      };
    }
  }
  return { allowed: true };
}

/**
 * Moderate text content using OpenAI Moderation API + keyword fallback.
 * Returns { allowed: true } if content is safe, or { allowed: false, reason, flaggedCategories } if not.
 */
export async function moderateContent(text: string): Promise<ModerationResult> {
  // 1. Always run keyword check first (zero latency, no API needed)
  const kwResult = keywordCheck(text);
  if (!kwResult.allowed) return kwResult;

  // 2. If OpenAI key is available, use the moderation endpoint (free, no token cost)
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.moderations.create({ input: text });
      const result = response.results[0];

      if (result.flagged) {
        const flagged = Object.entries(result.categories)
          .filter(([, v]) => v)
          .map(([k]) => k);

        return {
          allowed: false,
          reason: 'Content was flagged by automated moderation.',
          flaggedCategories: flagged,
        };
      }
    } catch (err) {
      // If moderation API fails, allow the post (fail-open) but log
      console.error('Moderation API error (failing open):', err);
    }
  }

  return { allowed: true };
}
