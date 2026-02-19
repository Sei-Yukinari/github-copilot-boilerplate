import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translateStory } from '@/lib/gemini';
import type { Story } from '@/lib/types';

// extractJsonBlock is not exported, so we replicate it for testing
function extractJsonBlock(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return text.trim();
}

describe('extractJsonBlock', () => {
  it('fenced json block を正しく抽出する', () => {
    const input = '```json\n{"titleJa": "テスト"}\n```';
    const result = extractJsonBlock(input);
    expect(result).toBe('{"titleJa": "テスト"}');
  });

  it('fenced block (lang指定なし) を正しく抽出する', () => {
    const input = '```\n{"titleJa": "テスト"}\n```';
    const result = extractJsonBlock(input);
    expect(result).toBe('{"titleJa": "テスト"}');
  });

  it('fenceなしの場合はtrimして返す', () => {
    const input = '  {"titleJa": "テスト"}  ';
    const result = extractJsonBlock(input);
    expect(result).toBe('{"titleJa": "テスト"}');
  });

  it('空文字列の場合は空文字列を返す', () => {
    const result = extractJsonBlock('');
    expect(result).toBe('');
  });

  it('前後にテキストがあるfenced blockを抽出する', () => {
    const input =
      'Here is the result:\n```json\n{"titleJa": "テスト"}\n```\nDone.';
    const result = extractJsonBlock(input);
    expect(result).toBe('{"titleJa": "テスト"}');
  });
});

// --- translateStory のテスト ---

const mockStory: Story = {
  id: 1,
  title: 'Test Story',
  url: 'https://example.com',
  score: 100,
  by: 'testuser',
  time: 1234567890,
  type: 'story',
};

function makeGeminiResponse(text: string, status = 200): Response {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text }] } }],
    }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

describe('translateStory', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('GEMINI_API_KEY が未設定の場合、エラー結果を返す', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const result = await translateStory(mockStory);
    expect(result.error).toContain('GEMINI_API_KEY');
    expect(result.titleJa).toBe(mockStory.title);
  });

  it('API成功時に翻訳結果を返す', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    const responseText = JSON.stringify({
      titleJa: 'テストストーリー',
      summaryJa: 'これはテストです。',
      warning: '',
    });
    vi.mocked(fetch).mockResolvedValueOnce(makeGeminiResponse(responseText));

    const result = await translateStory(mockStory);
    expect(result.titleJa).toBe('テストストーリー');
    expect(result.summaryJa).toBe('これはテストです。');
    expect(result.error).toBeUndefined();
    expect(result.warning).toBeUndefined();
  });

  it('fenced JSON ブロックを含むレスポンスを正しくパースする', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    const responseText =
      '```json\n{"titleJa": "テスト", "summaryJa": "要約", "warning": ""}\n```';
    vi.mocked(fetch).mockResolvedValueOnce(makeGeminiResponse(responseText));

    const result = await translateStory(mockStory);
    expect(result.titleJa).toBe('テスト');
    expect(result.summaryJa).toBe('要約');
  });

  it('JSONパース失敗時にフォールバック結果を返す', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.mocked(fetch).mockResolvedValueOnce(
      makeGeminiResponse('not valid json at all')
    );

    const result = await translateStory(mockStory);
    expect(result.titleJa).toBe(mockStory.title);
    expect(result.summaryJa).toContain('解析に失敗');
  });

  it('ネットワークエラー時にエラー結果を返す', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));

    const result = await translateStory(mockStory);
    expect(result.error).toContain('接続に失敗');
    expect(result.titleJa).toBe(mockStory.title);
  });

  it('リトライ対象のステータスコード(429)でリトライする', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    // タイマーをモック化してリトライ遅延をスキップ
    vi.useFakeTimers();
    const successText = JSON.stringify({
      titleJa: '成功',
      summaryJa: '要約',
      warning: '',
    });
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('', { status: 429 }))
      .mockResolvedValueOnce(makeGeminiResponse(successText));

    const promise = translateStory(mockStory);
    // リトライ遅延（1000ms）を進める
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.titleJa).toBe('成功');
    vi.useRealTimers();
  });
});
