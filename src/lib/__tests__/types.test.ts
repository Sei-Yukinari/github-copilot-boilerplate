import { describe, it, expect } from 'vitest';
import type { HNItemType, Story, TranslationResult } from '@/lib/types';

describe('Story type', () => {
  it('正常なStoryオブジェクトを作成できる', () => {
    const story = {
      id: 12345,
      title: 'Test Story',
      url: 'https://example.com',
      type: 'story',
      by: 'testuser',
      score: 100,
      time: 1700000000,
      descendants: 50,
    } satisfies Story;
    expect(story.id).toBe(12345);
    expect(story.type).toBe('story');
  });

  it('必須フィールドのみで作成できる', () => {
    const story = { id: 1, title: 'Minimal' } satisfies Story;
    expect(story.id).toBe(1);
    expect(story.url).toBeUndefined();
  });

  it('typeはHNItemType union型のみ許容する', () => {
    const types: HNItemType[] = ['story', 'comment', 'poll', 'job', 'pollopt'];
    types.forEach((t) => {
      const story = { id: 1, title: 'Test', type: t } satisfies Story;
      expect(story.type).toBe(t);
    });
  });
});

describe('TranslationResult type', () => {
  it('正常な翻訳結果を作成できる', () => {
    const result = {
      titleJa: 'テストタイトル',
      summaryJa: 'テスト要約',
    } satisfies TranslationResult;
    expect(result.titleJa).toBe('テストタイトル');
    expect(result.error).toBeUndefined();
  });

  it('エラー付き翻訳結果を作成できる', () => {
    const result = {
      titleJa: 'Original Title',
      summaryJa: '翻訳失敗',
      error: 'API error',
      warning: '注意事項',
    } satisfies TranslationResult;
    expect(result.error).toBe('API error');
    expect(result.warning).toBe('注意事項');
  });
});
