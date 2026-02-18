import { StoryCard } from '@/components/StoryCard';
import { Story } from '@/lib/types';

type StoryListProps = {
  stories: Story[];
};

export function StoryList({ stories }: StoryListProps) {
  return (
    <ul className="space-y-3">
      {stories.map((story, index) => (
        <StoryCard key={story.id} rank={index + 1} story={story} />
      ))}
    </ul>
  );
}
