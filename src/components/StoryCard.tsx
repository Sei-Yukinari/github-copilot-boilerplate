import Link from 'next/link';

import { Story } from '@/lib/types';

type StoryCardProps = {
  rank: number;
  story: Story;
};

export function StoryCard({ rank, story }: StoryCardProps) {
  return (
    <li>
      <Link
        href={`/story/${story.id}`}
        className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p className="text-sm font-semibold text-slate-500">#{rank}</p>
        <p className="text-lg font-semibold hover:underline">{story.title}</p>
        <p className="mt-1 text-sm text-slate-500">score: {story.score ?? 0}</p>
      </Link>
    </li>
  );
}
