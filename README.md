# Hacker News 翻訳サイト

Hacker News のトップストーリーを要約・日本語翻訳して表示する Next.js アプリです。

## セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集して各変数を設定（下記「環境変数」参照）

# DB起動 + マイグレーション（初回）
make setup

# 開発サーバー起動
make dev
# または
npm run dev
```

## 主要コマンド

| コマンド                 | 内容                                       |
| ------------------------ | ------------------------------------------ |
| `npm run dev`            | 開発サーバー起動 (http://localhost:3000)   |
| `npm run build`          | DBマイグレーション + プロダクションビルド  |
| `npm run start`          | プロダクションサーバー起動                 |
| `npm test`               | ユニットテスト実行                         |
| `npm test -- --coverage` | カバレッジレポート付きテスト実行           |
| `npm run test:e2e`       | E2E テスト実行（要: 開発サーバー起動済み） |
| `npm run lint`           | ESLint + Prettier + 型チェック             |
| `npm run format`         | Prettier フォーマット                      |
| `make setup`             | DB起動 + 初回マイグレーション              |
| `make migrate`           | Prisma マイグレーション実行                |
| `make db`                | DB コンソール接続                          |

## 環境変数

`.env.example` をコピーして `.env.local` を作成してください。

| 変数名                | 必須 | 説明                   |
| --------------------- | ---- | ---------------------- |
| `GEMINI_API_KEY`      | ✅   | Google Gemini API キー |
| `DATABASE_URL`        | ✅   | PostgreSQL 接続文字列  |
| `BASIC_AUTH_USER`     | ✅   | Basic認証ユーザー名    |
| `BASIC_AUTH_PASSWORD` | ✅   | Basic認証パスワード    |

- `GEMINI_API_KEY` 未設定時は翻訳をスキップし、原文表示と警告メッセージを表示します
- `DATABASE_URL` のデフォルト（Docker）: `postgresql://postgres:postgres@localhost:5432/hn_translate`
- Basic認証の資格情報は `.env.local` とデプロイ先の環境変数のみで管理し、リポジトリにコミットしないでください

## アーキテクチャ

- **Next.js 16.x** App Router（Server Components + API Routes）
- **Hacker News API** クライアント (`src/lib/hackernews.ts`) — 5分キャッシュ・リトライ付き（最大3回）
- **Gemini API** クライアント (`src/lib/gemini.ts`) — `gemini-2.5-flash` モデル・リトライ付き（最大3回）
- **PostgreSQL + Prisma** による翻訳キャッシュ永続化 (`src/lib/translation-store.ts`) — 24時間 TTL
- **Basic認証** ミドルウェア (`src/proxy.ts`) — 全ルート対象
- **レート制限** (`src/lib/rate-limit.ts`) — `/api/translate` に IP ベース制限（1分あたり10リクエスト）

詳細設計は `doc/architecture.md` を参照してください。

## セキュリティ

- **Basic認証**: 全ルートに適用（`BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` で設定）
- **Content-Security-Policy**: `script-src`, `style-src`, `connect-src` 等を制限
- **レート制限**: `/api/translate` に 1分10リクエスト制限（超過時: 429 + `Retry-After` ヘッダ）
- **XSS 対策**: `react-markdown` によりユーザー入力の raw HTML をデフォルトで無効化

## 翻訳の挙動

- 詳細ページでは Gemini に記事 URL を渡し、リンク先内容の要約・翻訳を試みます
- リンク先にアクセスできない場合は、タイトルベースの要約にフォールバックし、警告を表示します
- 翻訳結果は DB に保存され、同じ記事への再アクセス時は Gemini API を呼び出しません（24時間キャッシュ）
- キャッシュが12時間以上経過した場合は stale-while-revalidate でバックグラウンド再翻訳を行います

## テスト

```bash
# ユニットテスト（vitest）
npm test

# カバレッジレポート（閾値: lines/funcs/branches 60%）
npm test -- --coverage

# E2E テスト（Playwright）
npm run test:e2e
```

カバレッジ目標: Statements 95%+, Branches 70%+, Functions 90%+
