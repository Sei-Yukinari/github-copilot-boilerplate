import { prisma } from '@/lib/db';
import { TranslationResult } from '@/lib/types';

/** キャッシュの有効期間（ミリ秒）: 7日 */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** キャッシュが古い（再取得推奨）と判断する閾値: 3日 */
const STALE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

export type CachedTranslation = TranslationResult & {
  /** trueの場合、バックグラウンドで再翻訳を推奨 */
  isStale?: boolean;
};

export async function getTranslation(
  storyId: number
): Promise<CachedTranslation | null> {
  try {
    const row = await prisma.translation.findUnique({ where: { storyId } });
    if (!row) return null;

    const age = Date.now() - row.updatedAt.getTime();

    // TTL超過: キャッシュ無効として扱う
    if (age > CACHE_TTL_MS) {
      return null;
    }

    return {
      titleJa: row.titleJa,
      summaryJa: row.summaryJa,
      isStale: age > STALE_THRESHOLD_MS,
    };
  } catch (error) {
    console.error('Failed to fetch translation from DB:', {
      storyId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function saveTranslation(
  storyId: number,
  result: TranslationResult
): Promise<void> {
  try {
    await prisma.translation.upsert({
      where: { storyId },
      update: { titleJa: result.titleJa, summaryJa: result.summaryJa },
      create: { storyId, titleJa: result.titleJa, summaryJa: result.summaryJa },
    });
  } catch (error) {
    console.error('Failed to save translation to DB:', {
      storyId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** TTLを超過した古いキャッシュを一括削除する */
export async function cleanupExpiredTranslations(): Promise<number> {
  const cutoff = new Date(Date.now() - CACHE_TTL_MS);
  const { count } = await prisma.translation.deleteMany({
    where: { updatedAt: { lt: cutoff } },
  });
  return count;
}
