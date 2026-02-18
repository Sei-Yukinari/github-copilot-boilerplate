# Hacker News 翻訳サイト

Hacker News のトップストーリーを要約・日本語翻訳して表示する Next.js アプリです。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.local に GEMINI_API_KEY / BASIC_AUTH_USER / BASIC_AUTH_PASSWORD を設定
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

## 環境変数

- `GEMINI_API_KEY` (必須): Gemini API キー
- `BASIC_AUTH_USER` (必須): Basic認証ユーザー名
- `BASIC_AUTH_PASSWORD` (必須): Basic認証パスワード

未設定時は翻訳をスキップし、原文表示と警告メッセージを表示します。
Basic認証の値は public リポジトリにコミットせず、`.env.local` とデプロイ先の環境変数で管理してください。

## Phase 2 の挙動

- 詳細ページでは、Gemini に記事URLを渡してリンク先内容の要約・翻訳を試みます。
- リンク先にアクセスできない場合は、タイトルベースの要約にフォールバックし、警告を表示します。
