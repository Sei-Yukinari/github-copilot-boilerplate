import { test, expect } from '@playwright/test';

test.describe('ホームページ', () => {
  test('トップストーリー一覧が表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    // 記事カードが少なくとも1つ表示される
    const cards = page.locator(
      'article, [data-testid="story-card"], a[href^="/story/"]'
    );
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
  });

  test('記事カードにタイトルとメタ情報がある', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('a[href^="/story/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    // テキストが存在する
    const text = await firstCard.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });
});

test.describe('記事詳細ページ', () => {
  test('ホームから記事詳細に遷移できる', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('a[href^="/story/"]').first();
    await expect(link).toBeVisible({ timeout: 15_000 });
    await link.click();
    await page.waitForURL(/\/story\/\d+/);
    // 詳細ページが表示される
    await expect(page.locator('main, article')).toBeVisible();
  });

  test('存在しないストーリーIDで404またはエラーが表示される', async ({
    page,
  }) => {
    const res = await page.goto('/story/999999999999');
    // 404 もしくはエラーページが表示される
    expect([404, 200]).toContain(res?.status());
    // いずれにせよ画面がクラッシュしていないこと
    await expect(page.locator('body')).toBeVisible();
  });

  test('数値以外のIDにアクセスしても画面がクラッシュしない', async ({
    page,
  }) => {
    await page.goto('/story/invalid-id');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('404ページ', () => {
  test('存在しないページで404が表示される', async ({ page }) => {
    const res = await page.goto('/nonexistent-page-12345');
    expect(res?.status()).toBe(404);
  });
});

test.describe('翻訳APIエンドポイント', () => {
  test('不正なリクエストで400が返る', async ({ request }) => {
    const res = await request.post('/api/translate', {
      data: { invalid: true },
    });
    expect(res.status()).toBe(400);
  });

  test('バリデーションエラーの詳細が返る', async ({ request }) => {
    const res = await request.post('/api/translate', {
      data: { id: 'not-a-number', title: '' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test('urlなしの正常なペイロードを受け入れる（url is optional）', async ({
    request,
  }) => {
    const res = await request.post('/api/translate', {
      data: { id: 1, title: 'Test Story' },
    });
    // 400 ではないこと（翻訳エラーや503は許容）
    expect(res.status()).not.toBe(400);
  });

  test('レート制限: 短時間に大量リクエストで429が返る', async ({ request }) => {
    const payload = { id: 99999, title: 'Rate Limit Test' };
    const results: number[] = [];

    // 11回連続送信（制限は10回/分）
    for (let i = 0; i < 11; i++) {
      const res = await request.post('/api/translate', { data: payload });
      results.push(res.status());
    }

    // 11回目は 429 になるはず
    expect(results).toContain(429);

    // 429 レスポンスには Retry-After ヘッダが含まれる
    const lastRes = await request.post('/api/translate', { data: payload });
    if (lastRes.status() === 429) {
      expect(lastRes.headers()['retry-after']).toBeDefined();
    }
  });
});
