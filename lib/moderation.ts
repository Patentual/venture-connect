import OpenAI from 'openai';

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  flaggedCategories?: string[];
  recruitmentDetected?: boolean;
}

// Recruitment-style message patterns
const RECRUITMENT_PATTERNS = [
  /\b(job\s*opening|job\s*opportunity|we('re|\s+are)\s+hiring|open\s*position|open\s*role)\b/i,
  /\b(salary\s*(range|of|is|between|up\s*to)|compensation\s*(package|of))\b/i,
  /\b(head\s*hunt|talent\s*acqui|sourcing\s*candidates|recruit\s*(for|on\s*behalf))\b/i,
  /\b(apply\s*(now|today|here)|submit\s*(your|a)\s*resume|send\s*(your|a)\s*cv)\b/i,
  /\b(interview\s*(slot|schedule|you)|schedule\s*a\s*call\s*(to\s*discuss|about\s*a))\b/i,
  /\b(on\s*behalf\s*of\s*(my|our|a)\s*client|retained\s*search|executive\s*search)\b/i,
  /\b(we('d|\s+would)\s+love\s+to\s+(have|get)\s+you|perfect\s+(fit|candidate)\s+for)\b/i,
  /\b(talent\s*pool|pipeline\s*of\s*candidates|staffing\s*(agency|firm|solution))\b/i,
];

/** Check if text contains recruitment-style language. */
export function detectRecruitment(text: string): { detected: boolean; matchCount: number } {
  let matchCount = 0;
  for (const pattern of RECRUITMENT_PATTERNS) {
    if (pattern.test(text)) matchCount++;
  }
  // Require at least 2 pattern matches to reduce false positives
  return { detected: matchCount >= 2, matchCount };
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

  // 3. Check for recruitment-style content
  const recruitCheck = detectRecruitment(text);
  if (recruitCheck.detected) {
    return {
      allowed: true,
      recruitmentDetected: true,
      flaggedCategories: ['recruitment_language'],
    };
  }

  return { allowed: true };
}
