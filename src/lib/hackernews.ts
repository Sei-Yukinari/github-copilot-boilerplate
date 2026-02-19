import { Story } from '@/lib/types';

const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0';

/** Hacker Newsのトップストーリーを取得する */
export async function getTopStories(limit = 10): Promise<number[]> {
  const res = await fetch(`${HN_BASE_URL}/topstories.json`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch top stories. Status: ${res.status}`);
  }
  const ids = (await res.json()) as number[];
  return ids.slice(0, limit);
}

/** Hacker Newsのストーリー詳細を取得する */
export async function getStoryById(id: number): Promise<Story> {
  const res = await fetch(`${HN_BASE_URL}/item/${id}.json`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch story: ${id}`);
  }
  const story = (await res.json()) as Story | null;
  if (!story) {
    throw new Error(`Story not found: ${id}`);
  }
  if (story.type !== 'story') {
    throw new Error(`Unsupported item type for story ${id}: ${story.type}`);
  }
  return story;
}

/** 複数ストーリーを並列取得する */
export async function getTopStoriesWithDetails(limit = 10): Promise<Story[]> {
  const ids = await getTopStories(limit);
  const results = await Promise.allSettled(ids.map((id) => getStoryById(id)));

  const stories: Story[] = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      stories.push(result.value);
    } else {
      console.warn('Failed to fetch story:', {
        storyId: ids[i],
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      });
    }
  });

  return stories;
}
