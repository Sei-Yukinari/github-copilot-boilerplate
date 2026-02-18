import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

type HNItemType = 'story' | 'comment' | 'poll' | 'job' | 'pollopt';

type Story = {
  by?: string;
  descendants?: number;
  id: number;
  score?: number;
  time?: number;
  title: string;
  type?: HNItemType;
  url?: string;
};

describe('Story type', () => {
  it('正常なStoryオブジェクトを作成できる', () => {
    const story: Story = {
      id: 12345,
      title: 'Test Story',
      url: 'https://example.com',
      type: 'story',
      by: 'testuser',
      score: 100,
      time: 1700000000,
      descendants: 50,
    };
    assert.equal(story.id, 12345);
    assert.equal(story.type, 'story');
  });

  it('必須フィールドのみで作成できる', () => {
    const story: Story = { id: 1, title: 'Minimal' };
    assert.equal(story.id, 1);
    assert.equal(story.url, undefined);
  });

  it('typeはHNItemType union型のみ許容する', () => {
    const types: HNItemType[] = ['story', 'comment', 'poll', 'job', 'pollopt'];
    types.forEach((t) => {
      const story: Story = { id: 1, title: 'Test', type: t };
      assert.equal(story.type, t);
    });
  });
});

type TranslationResult = {
  error?: string;
  summaryJa: string;
  titleJa: string;
  warning?: string;
};

describe('TranslationResult type', () => {
  it('正常な翻訳結果を作成できる', () => {
    const result: TranslationResult = {
      titleJa: 'テストタイトル',
      summaryJa: 'テスト要約',
    };
    assert.equal(result.titleJa, 'テストタイトル');
    assert.equal(result.error, undefined);
  });

  it('エラー付き翻訳結果を作成できる', () => {
    const result: TranslationResult = {
      titleJa: 'Original Title',
      summaryJa: '翻訳失敗',
      error: 'API error',
      warning: '注意事項',
    };
    assert.equal(result.error, 'API error');
    assert.equal(result.warning, '注意事項');
  });
});
