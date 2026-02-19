import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTopStories,
  getStoryById,
  getTopStoriesWithDetails,
} from '@/lib/hackernews';

const mockStory = {
  id: 1,
  title: 'Test Story',
  url: 'https://example.com',
  score: 100,
  by: 'testuser',
  time: 1234567890,
  type: 'story',
};

function makeJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('getTopStories', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('トップストーリーのIDリストを返す', async () => {
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(ids));

    const result = await getTopStories(10);
    expect(result).toHaveLength(10);
    expect(result[0]).toBe(1);
  });

  it('limit未満の件数しかない場合はそのまま返す', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse([1, 2, 3]));
    const result = await getTopStories(10);
    expect(result).toEqual([1, 2, 3]);
  });

  it('APIがエラーを返した場合に例外をスローする（リトライ後 HTTP 500）', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 500 }));

    const promise = expect(getTopStories()).rejects.toThrow('HTTP 500');
    await vi.runAllTimersAsync();
    await promise;
    expect(fetch).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it('ネットワークエラー時にリトライして最終的に例外をスローする', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));

    // rejection ハンドラを先に登録して Unhandled Rejection を防ぐ
    const promise = expect(getTopStories()).rejects.toThrow('Network failure');
    await vi.runAllTimersAsync();
    await promise;
    // 3回リトライする
    expect(fetch).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it('429エラー後にリトライして成功する', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('', { status: 429 }))
      .mockResolvedValueOnce(makeJsonResponse([1, 2, 3]));

    const promise = getTopStories(3);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual([1, 2, 3]);
    vi.useRealTimers();
  });
});

describe('getStoryById', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ストーリーを取得して返す', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(mockStory));
    const result = await getStoryById(1);
    expect(result.id).toBe(1);
    expect(result.title).toBe('Test Story');
  });

  it('APIがエラーを返した場合に例外をスローする', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 404 }));
    await expect(getStoryById(999)).rejects.toThrow('Failed to fetch story');
  });

  it('nullが返された場合に例外をスローする', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(null));
    await expect(getStoryById(1)).rejects.toThrow('Story not found');
  });

  it('type が story 以外の場合に例外をスローする', async () => {
    const comment = { ...mockStory, type: 'comment' };
    vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(comment));
    await expect(getStoryById(1)).rejects.toThrow('Unsupported item type');
  });
});

describe('getTopStoriesWithDetails', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('複数ストーリーを並列取得して返す', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(makeJsonResponse([1, 2]))
      .mockResolvedValueOnce(makeJsonResponse({ ...mockStory, id: 1 }))
      .mockResolvedValueOnce(makeJsonResponse({ ...mockStory, id: 2 }));

    const result = await getTopStoriesWithDetails(2);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.id)).toEqual([1, 2]);
  });

  it('一部のストーリー取得が失敗しても残りを返す', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(makeJsonResponse([1, 2]))
      .mockResolvedValueOnce(makeJsonResponse({ ...mockStory, id: 1 }))
      .mockResolvedValueOnce(new Response('', { status: 500 }));

    const result = await getTopStoriesWithDetails(2);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});
