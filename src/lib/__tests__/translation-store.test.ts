import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTranslation,
  saveTranslation,
  cleanupExpiredTranslations,
} from '@/lib/translation-store';

// prisma をモック化
vi.mock('@/lib/db', () => ({
  prisma: {
    translation: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/db';

const NOW = new Date('2024-01-01T12:00:00Z').getTime();

describe('getTranslation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('キャッシュが存在しない場合は null を返す', async () => {
    vi.mocked(prisma.translation.findUnique).mockResolvedValueOnce(null);
    const result = await getTranslation(1);
    expect(result).toBeNull();
  });

  it('有効なキャッシュを返す', async () => {
    const row = {
      storyId: 1,
      titleJa: 'テストタイトル',
      summaryJa: 'テスト要約',
      createdAt: new Date(NOW - 1000),
      updatedAt: new Date(NOW - 1000), // 1秒前
    };
    vi.mocked(prisma.translation.findUnique).mockResolvedValueOnce(row);

    const result = await getTranslation(1);
    expect(result).not.toBeNull();
    expect(result?.titleJa).toBe('テストタイトル');
    expect(result?.summaryJa).toBe('テスト要約');
    expect(result?.isStale).toBe(false);
  });

  it('TTL（24時間）を超えたキャッシュは null を返す', async () => {
    const row = {
      storyId: 1,
      titleJa: 'テストタイトル',
      summaryJa: 'テスト要約',
      createdAt: new Date(NOW - 25 * 60 * 60 * 1000),
      updatedAt: new Date(NOW - 25 * 60 * 60 * 1000), // 25時間前
    };
    vi.mocked(prisma.translation.findUnique).mockResolvedValueOnce(row);

    const result = await getTranslation(1);
    expect(result).toBeNull();
  });

  it('12時間以上経過したキャッシュは isStale = true を返す', async () => {
    const row = {
      storyId: 1,
      titleJa: 'テストタイトル',
      summaryJa: 'テスト要約',
      createdAt: new Date(NOW - 13 * 60 * 60 * 1000),
      updatedAt: new Date(NOW - 13 * 60 * 60 * 1000), // 13時間前
    };
    vi.mocked(prisma.translation.findUnique).mockResolvedValueOnce(row);

    const result = await getTranslation(1);
    expect(result?.isStale).toBe(true);
  });

  it('DBエラー時に例外をスローする', async () => {
    vi.mocked(prisma.translation.findUnique).mockRejectedValueOnce(
      new Error('DB connection failed')
    );
    await expect(getTranslation(1)).rejects.toThrow('DB connection failed');
  });
});

describe('saveTranslation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('翻訳をDBにupsertする', async () => {
    vi.mocked(prisma.translation.upsert).mockResolvedValueOnce({
      storyId: 1,
      titleJa: 'タイトル',
      summaryJa: '要約',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await saveTranslation(1, { titleJa: 'タイトル', summaryJa: '要約' });
    expect(prisma.translation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { storyId: 1 },
        update: { titleJa: 'タイトル', summaryJa: '要約' },
      })
    );
  });

  it('DBエラー時に例外をスローする', async () => {
    vi.mocked(prisma.translation.upsert).mockRejectedValueOnce(
      new Error('DB write failed')
    );
    await expect(
      saveTranslation(1, { titleJa: 'タイトル', summaryJa: '要約' })
    ).rejects.toThrow('DB write failed');
  });
});

describe('cleanupExpiredTranslations', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('期限切れの翻訳を削除して件数を返す', async () => {
    vi.mocked(prisma.translation.deleteMany).mockResolvedValueOnce({
      count: 3,
    });
    const count = await cleanupExpiredTranslations();
    expect(count).toBe(3);
    expect(prisma.translation.deleteMany).toHaveBeenCalledOnce();
  });
});
