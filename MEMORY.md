# MEMORY

## コードベースの重要な知見
- Phase 1は Next.js 最新安定版（App Router）で実装。
- `GEMINI_API_KEY` 未設定時は翻訳をスキップし、原文表示＋明示メッセージを返す仕様。
- Phase 2は本文スクレイピングを行わず、URLをGeminiに渡す方式を採用。
- リンク先アクセス不能時はタイトルベース要約にフォールバックし、warningを表示。

## 過去のトラブルと解決策
- Next.js 16 + Tailwind `latest` で PostCSSプラグインエラーが発生。
- `tailwindcss` を `^3.4.17` に固定することでビルド成功。

## よく使うコマンド・パターン
- 検証コマンド: `npm run lint && npm test && npm run build`
