# MEMORY

## コードベースの重要な知見

- Phase 1は Next.js 最新安定版（App Router）で実装。
- `GEMINI_API_KEY` 未設定時は翻訳をスキップし、原文表示＋明示メッセージを返す仕様。
- Phase 2は本文スクレイピングを行わず、URLをGeminiに渡す方式を採用。
- リンク先アクセス不能時はタイトルベース要約にフォールバックし、warningを表示。
- 公開運用向けに `src/middleware.ts` でサイト全体（`/api` 含む）へ Basic認証を適用する方針。認証情報は `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` の環境変数で管理。

## 過去のトラブルと解決策

- Basic認証不具合: Edge Runtimeで `crypto.timingSafeEqual` を使うと動作不全。`middleware.ts` ではNodeモジュールを使わず文字列比較に変更して解消。
- Next.js 16 + Tailwind `latest` で PostCSSプラグインエラーが発生。
- `tailwindcss` を `^3.4.17` に固定することでビルド成功。

## よく使うコマンド・パターン

- 検証コマンド: `npm run lint && npm test && npm run build`
