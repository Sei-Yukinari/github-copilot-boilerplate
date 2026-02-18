import Link from 'next/link';

import { Story } from '@/lib/types';

type StoryCardProps = {
  rank: number;
  story: Story;
};

export function StoryCard({ rank, story }: StoryCardProps) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">#{rank}</p>
      <Link className="text-lg font-semibold hover:underline" href={`/story/${story.id}`}>
        {story.title}
      </Link>
      <p className="mt-1 text-sm text-slate-500">score: {story.score ?? 0}</p>
    </li>
  );
}
