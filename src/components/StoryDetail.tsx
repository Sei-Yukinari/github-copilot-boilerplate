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
      <div>
        <Link href="/" className="text-sm text-orange-500 hover:underline">
          ← 一覧に戻る
        </Link>
      </div>
      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 leading-snug">
          {story.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          {story.by && <span>by {story.by}</span>}
          <span>▲ {story.score ?? 0} points</span>
          {story.descendants != null && (
            <span>💬 {story.descendants} comments</span>
          )}
        </div>
        {story.url ? (
          <Link
            className="inline-block rounded bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            href={story.url}
            rel="noreferrer"
            target="_blank"
          >
            原文を開く →
          </Link>
        ) : (
          <p className="text-sm text-slate-400">URLはありません。</p>
        )}
      </section>
      <TranslatedContent translation={translation} />
    </div>
  );
}
