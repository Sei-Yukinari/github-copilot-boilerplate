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
});
