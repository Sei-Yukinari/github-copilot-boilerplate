import { prisma } from '@/lib/db';
import { TranslationResult } from '@/lib/types';

export async function getTranslation(storyId: number): Promise<TranslationResult | null> {
  const row = await prisma.translation.findUnique({ where: { storyId } });
  if (!row) return null;
  return { titleJa: row.titleJa, summaryJa: row.summaryJa };
}

export async function saveTranslation(storyId: number, result: TranslationResult): Promise<void> {
  await prisma.translation.upsert({
    where: { storyId },
    update: { titleJa: result.titleJa, summaryJa: result.summaryJa },
    create: { storyId, titleJa: result.titleJa, summaryJa: result.summaryJa },
  });
}
