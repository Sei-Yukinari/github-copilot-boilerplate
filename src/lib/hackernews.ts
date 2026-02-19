import { Story } from '@/lib/types';

const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0';

const MAX_RETRIES = 3;
const RETRY_STATUS_CODES = [429, 500, 502, 503];

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || !RETRY_STATUS_CODES.includes(res.status)) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
    if (attempt < maxRetries - 1) {
      const delay = Math.min(1000 * 2 ** attempt, 8000);
      console.warn(
        `HN API fetch failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
        { url }
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError ?? new Error('Retry failed');
}

/** Hacker Newsのトップストーリーを取得する */
export async function getTopStories(limit = 10): Promise<number[]> {
  const res = await fetchWithRetry(`${HN_BASE_URL}/topstories.json`, {
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
  const res = await fetchWithRetry(`${HN_BASE_URL}/item/${id}.json`, {
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
