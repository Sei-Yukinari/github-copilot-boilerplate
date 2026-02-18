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
        className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 hover:border-orange-400 hover:shadow-md"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-lg font-bold text-orange-400 leading-none">
            {rank}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold leading-snug text-slate-800 group-hover:underline">
              {story.title}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>▲ {story.score ?? 0} points</span>
              {story.by && <span>by {story.by}</span>}
              {story.descendants != null && (
                <span>💬 {story.descendants} comments</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
