import { prisma } from '@/lib/db';
import { TranslationResult } from '@/lib/types';

/** キャッシュの有効期間（ミリ秒）: 24時間 */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** キャッシュが古い（再取得推奨）と判断する閾値: 12時間 */
const STALE_THRESHOLD_MS = 12 * 60 * 60 * 1000;

export type CachedTranslation = TranslationResult & {
  /** trueの場合、バックグラウンドで再翻訳を推奨 */
  isStale?: boolean;
};

export async function getTranslation(
  storyId: number
): Promise<CachedTranslation | null> {
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
}

export async function saveTranslation(
  storyId: number,
  result: TranslationResult
): Promise<void> {
  await prisma.translation.upsert({
    where: { storyId },
    update: { titleJa: result.titleJa, summaryJa: result.summaryJa },
    create: { storyId, titleJa: result.titleJa, summaryJa: result.summaryJa },
  });
}

/** TTLを超過した古いキャッシュを一括削除する */
export async function cleanupExpiredTranslations(): Promise<number> {
  const cutoff = new Date(Date.now() - CACHE_TTL_MS);
  const { count } = await prisma.translation.deleteMany({
    where: { updatedAt: { lt: cutoff } },
  });
  return count;
}
