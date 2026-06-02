import { useMemo } from 'react';
import { similarityScore, normalizeText } from '@/lib/textUtils';

interface DuplicateResult {
  id: string;
  name: string;
  score: number;
  matchedFields: string[];
}

const SIMILARITY_THRESHOLD = 0.7;
const HIGH_SIMILARITY_THRESHOLD = 0.85;

export function useDuplicateDetection(
  currentName: string,
  existingItems: { id: string; name: string; email?: string | null }[],
  excludeId?: string,
  currentEmail?: string | null
): DuplicateResult[] {
  return useMemo(() => {
    const trimmed = currentName.trim();
    if (trimmed.length < 3) return [];
    const normalizedEmail = normalizeText(currentEmail);

    return existingItems
      .filter(item => item.id !== excludeId)
      .map(item => {
        const nameScore = similarityScore(trimmed, item.name);
        const emailScore = normalizedEmail && item.email
          ? similarityScore(normalizedEmail, item.email)
          : 0;

        return {
          id: item.id,
          name: item.name,
          score: Math.max(nameScore, emailScore),
          matchedFields: [
            ...(nameScore >= HIGH_SIMILARITY_THRESHOLD ? ['nombre'] : []),
            ...(emailScore >= HIGH_SIMILARITY_THRESHOLD ? ['correo electrónico'] : []),
          ],
        };
      })
      .filter(r => r.score >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [currentName, existingItems, excludeId, currentEmail]);
}
