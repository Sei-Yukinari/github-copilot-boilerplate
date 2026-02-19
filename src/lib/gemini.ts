import { Story, TranslationResult } from '@/lib/types';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const MAX_RETRIES = 3;
const RETRY_STATUS_CODES = [429, 500, 502, 503];

function extractJsonBlock(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return text.trim();
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.ok || !RETRY_STATUS_CODES.includes(res.status)) {
      return res;
    }
    lastError = new Error(`HTTP ${res.status}`);
    if (attempt < maxRetries) {
      const delay = Math.min(1000 * 2 ** attempt, 8000);
      console.warn(
        `Gemini API returned ${res.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError ?? new Error('Retry failed');
}

/** Gemini APIで要約と日本語翻訳を生成する */
export async function translateStory(story: Story): Promise<TranslationResult> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      error: 'GEMINI_API_KEY が未設定のため翻訳をスキップしました。',
      summaryJa: '翻訳機能は現在利用できません。原文を参照してください。',
      titleJa: story.title,
    };
  }

  const prompt = [
    'あなたはHacker News記事の翻訳アシスタントです。',
    '可能ならURL先ページの内容を読み取り、日本語タイトルと日本語要約を作成してください。',
    'URL先にアクセスできない、または内容を取得できない場合は、タイトル情報のみを使って要約してください。',
    'その場合は warning に「リンク先へアクセスできなかったため、タイトルベースで要約しました。」を入れてください。',
    'summaryJa は読みやすくなるよう整形してください。段落ごとに改行（\\n）で区切り、箇条書きがある場合は「・」を使い読みやすくしてください。',
    '出力はJSONのみで返し、キーは titleJa, summaryJa, warning としてください。warningは不要なら空文字で構いません。',
    `Title: ${story.title}`,
    `URL: ${story.url ?? 'N/A'}`,
  ].join('\n');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let res: Response;
  try {
    res = await fetchWithRetry(GEMINI_API_URL, {
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      method: 'POST',
      signal: controller.signal,
    });
  } catch (error) {
    const isTimeout =
      error instanceof DOMException && error.name === 'AbortError';
    console.error('Gemini API request failed:', {
      reason: isTimeout ? 'timeout (30s)' : 'network error',
      error: error instanceof Error ? error.message : String(error),
      storyTitle: story.title,
    });
    return {
      error: isTimeout
        ? '翻訳APIがタイムアウトしました（30秒）。'
        : '翻訳APIへの接続に失敗しました。',
      summaryJa: '翻訳に失敗しました。原文を参照してください。',
      titleJa: story.title,
    };
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    return {
      error: `翻訳APIの呼び出しに失敗しました (${res.status})`,
      summaryJa: '翻訳に失敗しました。原文を参照してください。',
      titleJa: story.title,
      warning: 'リンク先の要約を取得できませんでした。',
    };
  }

  const data: unknown = await res.json();

  const candidates =
    typeof data === 'object' &&
    data !== null &&
    'candidates' in data &&
    Array.isArray((data as { candidates: unknown }).candidates)
      ? (
          data as {
            candidates: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          }
        ).candidates
      : [];

  const text = candidates[0]?.content?.parts?.[0]?.text ?? '';

  try {
    const parsed = JSON.parse(extractJsonBlock(text)) as {
      summaryJa?: string;
      titleJa?: string;
      warning?: string;
    };
    return {
      summaryJa: parsed.summaryJa ?? '要約を生成できませんでした。',
      titleJa: parsed.titleJa ?? story.title,
      warning: parsed.warning || undefined,
    };
  } catch (error) {
    console.error('Failed to parse Gemini API response:', {
      error: error instanceof Error ? error.message : String(error),
      rawText: text,
      storyTitle: story.title,
    });
    return {
      summaryJa:
        '要約の解析に失敗しました。タイトルベースの要約として扱ってください。',
      titleJa: story.title,
      warning:
        'リンク先へのアクセス可否を判定できず、タイトルベースで表示しています。',
    };
  }
}
