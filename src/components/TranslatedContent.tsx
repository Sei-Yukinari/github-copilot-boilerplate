import { TranslationResult } from '@/lib/types';

type TranslatedContentProps = {
  translation: TranslationResult;
};

/** **bold** を <strong> に変換してReact要素の配列を返す */
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

/** 行をパースして適切な要素を返す */
function renderLine(line: string, i: number): React.ReactNode {
  const trimmed = line.trim();
  if (trimmed === '') return null;

  if (trimmed.startsWith('・')) {
    const content = trimmed.slice(1).trim();
    return (
      <li key={i} className="ml-2 text-base leading-relaxed">
        {renderInline(content)}
      </li>
    );
  }
  return (
    <p key={i} className="leading-relaxed">
      {renderInline(trimmed)}
    </p>
  );
}

export function TranslatedContent({ translation }: TranslatedContentProps) {
  const lines = translation.summaryJa.split('\n');

  // 箇条書き行とそれ以外をグループ化してレンダリング
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listStart = 0;

  const flushList = (key: number) => {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul key={`ul-${key}`} className="space-y-1 text-lg list-none">
        {listBuffer.map((l, j) => renderLine(l, j))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, i) => {
    if (line.trim().startsWith('・')) {
      if (listBuffer.length === 0) listStart = i;
      listBuffer.push(line);
    } else {
      flushList(listStart);
      const node = renderLine(line, i);
      if (node) nodes.push(node);
    }
  });
  flushList(listStart);

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-orange-600 border-b border-orange-100 pb-2">
        {translation.titleJa}
      </h2>
      <div className="space-y-3">{nodes}</div>
      {translation.warning ? <p className="text-sm text-amber-700">{translation.warning}</p> : null}
      {translation.error ? <p className="text-sm text-red-700">{translation.error}</p> : null}
    </section>
  );
}
