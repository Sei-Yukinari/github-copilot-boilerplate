import { TranslationResult } from '@/lib/types';

const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<number, { expiresAt: number; value: TranslationResult }>();

export function getCachedTranslation(storyId: number): TranslationResult | null {
  const item = cache.get(storyId);
  if (!item) {
    return null;
  }
  if (item.expiresAt < Date.now()) {
    cache.delete(storyId);
    return null;
  }
  return item.value;
}

export function setCachedTranslation(storyId: number, value: TranslationResult): void {
  cache.set(storyId, { expiresAt: Date.now() + TTL_MS, value });
}
