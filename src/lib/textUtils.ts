/**
 * Normalize text for fuzzy matching:
 * - Lowercase
 * - Remove diacritics (accents, tildes)
 * - Trim whitespace
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Check if `haystack` contains `needle` using accent/case insensitive partial matching
 */
export function fuzzyMatch(haystack: string | null | undefined, needle: string): boolean {
  if (!needle) return true;
  return normalizeText(haystack).includes(normalizeText(needle));
}

/**
 * Token-based match: returns true when every whitespace-separated token in `needle`
 * appears somewhere across the concatenated, normalized `haystacks`.
 * Useful for multi-field searches like "Andrea Cadavid" matching nombre+apellidos.
 */
export function fuzzyMatchAll(haystacks: (string | null | undefined)[], needle: string): boolean {
  if (!needle || !needle.trim()) return true;
  const combined = haystacks.map(h => normalizeText(h)).join(' ');
  const tokens = normalizeText(needle).split(/\s+/).filter(Boolean);
  return tokens.every(t => combined.includes(t));
}

/**
 * Sanitize text input: trim + collapse multiple spaces
 */
export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize all string fields in an object
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string') {
      (result as any)[key] = sanitizeText(result[key]);
    }
  }
  return result;
}

/**
/**
 * Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  const m = na.length;
  const n = nb.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = na[i - 1] === nb[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Find the best "did you mean?" suggestion from a list of candidates.
 * Returns the closest match within maxDistance edits, or null.
 */
export function findDidYouMean(
  query: string,
  candidates: string[],
  maxDistance = 2
): string | null {
  const nq = normalizeText(query);
  if (nq.length < 3) return null;

  let best: string | null = null;
  let bestDist = maxDistance + 1;

  for (const candidate of candidates) {
    const nc = normalizeText(candidate);
    // Quick length check to skip obviously distant strings
    if (Math.abs(nc.length - nq.length) > maxDistance) continue;
    const dist = levenshteinDistance(nq, nc);
    if (dist > 0 && dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  return best;
}

/**
 * Calculate similarity score between two strings (0-1) for duplicate detection
 * Uses normalized Levenshtein-like approach
 */
export function similarityScore(a: string, b: string): number {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  
  if (na === nb) return 1;
  if (!na || !nb) return 0;
  
  // Check if one contains the other
  if (na.includes(nb) || nb.includes(na)) {
    const longer = Math.max(na.length, nb.length);
    const shorter = Math.min(na.length, nb.length);
    return shorter / longer;
  }
  
  // Simple bigram similarity
  const getBigrams = (s: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.substring(i, i + 2));
    }
    return bigrams;
  };
  
  const bigramsA = getBigrams(na);
  const bigramsB = getBigrams(nb);
  
  let intersection = 0;
  bigramsA.forEach(b => { if (bigramsB.has(b)) intersection++; });
  
  return (2 * intersection) / (bigramsA.size + bigramsB.size);
}
