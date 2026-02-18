import { Story, TranslationResult } from '@/lib/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function extractJsonBlock(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return text.trim();
}

/** Gemini APIで要約と日本語翻訳を生成する */
export async function translateStory(story: Story): Promise<TranslationResult> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      error: 'GEMINI_API_KEY が未設定のため翻訳をスキップしました。',
      summaryJa: '翻訳機能は現在利用できません。原文を参照してください。',
      titleJa: story.title
    };
  }

  const prompt = [
    'あなたはHacker News記事の翻訳アシスタントです。',
    '可能ならURL先ページの内容を読み取り、日本語タイトルと日本語要約を作成してください。',
    'URL先にアクセスできない、または内容を取得できない場合は、タイトル情報のみを使って要約してください。',
    'その場合は warning に「リンク先へアクセスできなかったため、タイトルベースで要約しました。」を入れてください。',
    '出力はJSONのみで返し、キーは titleJa, summaryJa, warning としてください。warningは不要なら空文字で構いません。',
    `Title: ${story.title}`,
    `URL: ${story.url ?? 'N/A'}`
  ].join('\n');

  const res = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 }
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST'
  });

  if (!res.ok) {
    return {
      error: `翻訳APIの呼び出しに失敗しました (${res.status})`,
      summaryJa: '翻訳に失敗しました。原文を参照してください。',
      titleJa: story.title,
      warning: 'リンク先の要約を取得できませんでした。'
    };
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  try {
    const parsed = JSON.parse(extractJsonBlock(text)) as {
      summaryJa?: string;
      titleJa?: string;
      warning?: string;
    };
    return {
      summaryJa: parsed.summaryJa ?? '要約を生成できませんでした。',
      titleJa: parsed.titleJa ?? story.title,
      warning: parsed.warning || undefined
    };
  } catch (error) {
    console.error('Failed to parse Gemini API response:', {
      error: error instanceof Error ? error.message : String(error),
      rawText: text,
      storyTitle: story.title
    });
    return {
      summaryJa: '要約の解析に失敗しました。タイトルベースの要約として扱ってください。',
      titleJa: story.title,
      warning: 'リンク先へのアクセス可否を判定できず、タイトルベースで表示しています。'
    };
  }
}
