import { StoryList } from '@/components/StoryList';
import { getTopStoriesWithDetails } from '@/lib/hackernews';

export default async function HomePage() {
  const stories = await getTopStoriesWithDetails(10);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Hacker News 日本語ダイジェスト</h1>
      <StoryList stories={stories} />
    </div>
  );
}
