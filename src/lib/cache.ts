import { TranslationResult } from '@/lib/types';

const TTL_MS = 24 * 60 * 60 * 1000;
/**
 * In-memory, per-process cache for translation results.
 *
 * IMPORTANT:
 * - This cache is not persisted across server restarts.
 * - It is not shared between multiple instances or serverless invocations.
 * - In environments like Vercel or other serverless / horizontally scaled setups,
 *   each instance may have its own independent cache, leading to inconsistent
 *   cache hits and potentially increased API calls.
 *
 * This implementation is suitable for local development or single-instance
 * deployments. For production use where consistent, durable caching is required,
 * consider replacing this with a shared store such as Redis, Vercel KV, or
 * another external caching solution.
 */
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
