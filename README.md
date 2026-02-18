# Hacker News 翻訳サイト

Hacker News のトップストーリーを要約・日本語翻訳して表示する Next.js アプリです。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.local に GEMINI_API_KEY を設定
```

## 主要コマンド

- `npm run dev` 開発サーバー起動
- `npm run build` プロダクションビルド
- `npm run test` テスト実行
- `npm run lint` ESLint実行

## アーキテクチャ

- App Router (`src/app`)
- Hacker News API クライアント (`src/lib/hackernews.ts`)
- Gemini API クライアント (`src/lib/gemini.ts`)
- 翻訳キャッシュ (`src/lib/cache.ts`)

詳細設計は `doc/architecture.md` を参照してください。

## GitHub Copilot について

このプロジェクトでは GitHub Copilot を活用した開発を推奨しています。

- **使用される AI モデル**: GPT-4o, Claude Sonnet, o1, Gemini など（Auto 選択がデフォルト）
- **コードレビュー**: `.github/agents/reviewer.md` に定義された観点で自動レビュー
- **開発支援**: カスタムルールとエージェントで効率的な開発体験

詳細は [`doc/copilot-models.md`](doc/copilot-models.md) および [`.github/README.md`](.github/README.md) を参照してください。

## 環境変数

- `GEMINI_API_KEY` (必須): Gemini API キー

未設定時は翻訳をスキップし、原文表示と警告メッセージを表示します。

## Phase 2 の挙動

- 詳細ページでは、Gemini に記事URLを渡してリンク先内容の要約・翻訳を試みます。
- リンク先にアクセスできない場合は、タイトルベースの要約にフォールバックし、警告を表示します。
