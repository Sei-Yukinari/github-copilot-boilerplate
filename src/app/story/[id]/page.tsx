import { notFound } from 'next/navigation';

import { StoryDetail } from '@/components/StoryDetail';
import { getCachedTranslation, setCachedTranslation } from '@/lib/cache';
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

  try {
    const story = await getStoryById(id);
    const cached = getCachedTranslation(id);
    const translation = cached ?? (await translateStory(story));
    if (!cached && !translation.error) {
      setCachedTranslation(id, translation);
    }

    return <StoryDetail story={story} translation={translation} />;
  } catch (error) {
    // If the story is not found or there's an API failure, return 404
    notFound();
  }
}
