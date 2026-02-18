import { prisma } from '@/lib/db';
import { TranslationResult } from '@/lib/types';

export async function getTranslation(
  storyId: number
): Promise<TranslationResult | null> {
  try {
    const row = await prisma.translation.findUnique({ where: { storyId } });
    if (!row) return null;
    return { titleJa: row.titleJa, summaryJa: row.summaryJa };
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
