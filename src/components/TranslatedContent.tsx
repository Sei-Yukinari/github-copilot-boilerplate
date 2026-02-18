import { TranslationResult } from '@/lib/types';

type TranslatedContentProps = {
  translation: TranslationResult;
};

export function TranslatedContent({ translation }: TranslatedContentProps) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-xl font-bold">日本語タイトル: {translation.titleJa}</h2>
      <p>{translation.summaryJa}</p>
      {translation.warning ? <p className="text-sm text-amber-700">{translation.warning}</p> : null}
      {translation.error ? <p className="text-sm text-amber-700">{translation.error}</p> : null}
    </section>
  );
}
