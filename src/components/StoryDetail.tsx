import Link from 'next/link';

import { TranslatedContent } from '@/components/TranslatedContent';
import { Story, TranslationResult } from '@/lib/types';

type StoryDetailProps = {
  story: Story;
  translation: TranslationResult;
};

export function StoryDetail({ story, translation }: StoryDetailProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-bold">{story.title}</h1>
        {story.url ? (
          <Link className="text-blue-600 hover:underline" href={story.url} rel="noreferrer" target="_blank">
            原文リンクを開く
          </Link>
        ) : (
          <p className="text-sm text-slate-500">URLはありません。</p>
        )}
      </section>
      <TranslatedContent translation={translation} />
    </div>
  );
}
