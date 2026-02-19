# MEMORY

## コードベースの重要な知見

- Phase 1は Next.js 最新安定版（App Router）で実装。
- `GEMINI_API_KEY` 未設定時は翻訳をスキップし、原文表示＋明示メッセージを返す仕様。
- Phase 2は本文スクレイピングを行わず、URLをGeminiに渡す方式を採用。
- リンク先アクセス不能時はタイトルベース要約にフォールバックし、warningを表示。
- 公開運用向けに `src/proxy.ts` でサイト全体（`/api` 含む）へ Basic認証を適用する方針。認証情報は `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` の環境変数で管理。
- **翻訳キャッシュ TTL は 24時間**（`CACHE_TTL_MS`）、stale 閾値は 12時間（`STALE_THRESHOLD_MS`）。
- `translation-store.ts` の DB エラーは呼び出し元にスローする（null との混同を防ぐ）。`page.tsx` 側で `.catch()` により graceful degradation を実現。
- **レート制限**: `/api/translate` に IP ベースのインメモリ制限（1分10回）。`src/lib/rate-limit.ts` に実装。本番では Redis 等に移行を検討。
- **Gemini / HN API** ともに exponential backoff リトライ（最大3回、対象: 429/500/502/503）を実装済み。
- **react-markdown** で Gemini API 出力をレンダリング。「・」箇条書きは `preprocessMarkdown()` で `-` リスト記法に変換してから渡す。
- **Content-Security-Policy** を `next.config.mjs` の `headers()` に追加済み。`unsafe-eval` を含むため本番時は要検討。

## 過去のトラブルと解決策

- Basic認証不具合: Edge Runtimeで `crypto.timingSafeEqual` を使うと動作不全。`middleware.ts` ではNodeモジュールを使わず文字列比較に変更して解消。
- Next.js 16 + Tailwind `latest` で PostCSSプラグインエラーが発生。
- `tailwindcss` を `^3.4.17` に固定することでビルド成功。
- **vitest で `@/` パスエイリアスが解決できない問題**: `vitest.config.ts` に `resolve.alias` を追加して解消。tsconfig の paths だけでは vitest には効かない。
  ```ts
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
  ```
- **vitest でリトライロジックのテスト**: `vi.useFakeTimers()` + `vi.runAllTimersAsync()` でリトライ遅延をスキップ。rejection ハンドラを先に登録（`expect(promise).rejects.toThrow()`）して Unhandled Rejection を防ぐ。
- **500 はリトライ対象コード**: `fetchWithRetry` が 500 を受けるとリトライし、最終的に `HTTP 500` エラーをスローする。`Failed to fetch ...` メッセージは到達しないため、テストの期待値に注意。

## よく使うコマンド・パターン

- 検証コマンド: `npm run lint && npm test && npm run build`
- カバレッジ確認: `npm test -- --coverage`
- Prisma モック: `vi.mock('@/lib/db', () => ({ prisma: { translation: { findUnique: vi.fn(), ... } } }))`
- fetch グローバルモック: `vi.stubGlobal('fetch', vi.fn())` / `afterEach(() => vi.unstubAllGlobals())`
- 環境変数モック: `vi.stubEnv('GEMINI_API_KEY', 'test-key')` / `vi.unstubAllEnvs()`

## ユーザーの好み・スタイル

- 改善は Phase 分けで段階的に実施（Phase1: Critical → Phase2: Major → Phase3: Docs）
- コミットメッセージは日本語で内容を詳しく記述
- PR は各 Phase 完了後に作成
- 計画は plan.md + SQL todos で管理
