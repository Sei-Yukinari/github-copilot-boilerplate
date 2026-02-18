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
    if (error instanceof Error && error.message.includes('404')) {
      notFound();
    }
    throw error;
  }

  const cached = await getTranslation(id);
  const translation = cached ?? (await translateStory(story));
  if (!cached && !translation.error) {
    await saveTranslation(id, translation);
  }

  return <StoryDetail story={story} translation={translation} />;
}
