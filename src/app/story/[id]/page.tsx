import { notFound } from 'next/navigation';

import { StoryDetail } from '@/components/StoryDetail';
import { getTranslation, saveTranslation } from '@/lib/translation-store';
import { translateStory } from '@/lib/gemini';
import { getStoryById } from '@/lib/hackernews';

type StoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoryPage({ params }: StoryPageProps) {
  const { id: paramId } = await params;
  const id = Number(paramId);
  if (!Number.isInteger(id)) {
    notFound();
  }

  let story;
  try {
    story = await getStoryById(id);
  } catch (error) {
    console.error('Failed to fetch story:', {
      storyId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof Error && error.message.includes('Story not found')) {
      notFound();
    }
    throw error;
  }

  const cached = await getTranslation(id);
  const translation = cached ?? (await translateStory(story));

  // stale-while-revalidate: 古いキャッシュは返しつつバックグラウンドで再翻訳
  if (cached?.isStale) {
    translateStory(story)
      .then((fresh) => {
        if (!fresh.error) return saveTranslation(id, fresh);
      })
      .catch((err) =>
        console.warn('Background re-translation failed:', {
          storyId: id,
          error: err instanceof Error ? err.message : String(err),
        })
      );
  } else if (!cached && !translation.error) {
    await saveTranslation(id, translation);
  }

  return <StoryDetail story={story} translation={translation} />;
}
