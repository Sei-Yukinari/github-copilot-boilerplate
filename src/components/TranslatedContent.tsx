import ReactMarkdown from 'react-markdown';
import { TranslationResult } from '@/lib/types';

type TranslatedContentProps = {
  translation: TranslationResult;
};

/** Gemini API 出力の「・」箇条書きをMarkdownリスト記法に変換する */
function preprocessMarkdown(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      line.trim().startsWith('・') ? `- ${line.trim().slice(1).trim()}` : line
    )
    .join('\n');
}

export function TranslatedContent({ translation }: TranslatedContentProps) {
  const markdown = preprocessMarkdown(translation.summaryJa);

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-orange-600 border-b border-orange-100 pb-2">
        {translation.titleJa}
      </h2>
      <div className="space-y-3">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="leading-relaxed">{children}</p>,
            ul: ({ children }) => (
              <ul className="space-y-1 text-lg list-none">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="ml-2 text-base leading-relaxed">{children}</li>
            ),
            strong: ({ children }) => <strong>{children}</strong>,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
      {translation.warning ? (
        <p className="text-sm text-amber-700">{translation.warning}</p>
      ) : null}
      {translation.error ? (
        <p className="text-sm text-red-700">{translation.error}</p>
      ) : null}
    </section>
  );
}
