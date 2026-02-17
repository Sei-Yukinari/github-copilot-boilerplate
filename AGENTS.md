# Hacker News 翻訳サイト

## 概要

Hacker NewsのトップストーリーをGoogle Gemini APIで要約・日本語翻訳し、読みやすい形式で提供するWebアプリケーション。

## 技術スタック

- **フロントエンド**: Next.js 14+ (App Router), React 18+, TypeScript 5.x
- **スタイリング**: Tailwind CSS 3.x
- **API統合**: Hacker News API, Google Gemini API
- **ランタイム**: Node.js 18+
- **デプロイ**: Vercel (推奨)

## 主要コマンド

- dev: `npm run dev` - 開発サーバー起動 (http://localhost:3000)
- build: `npm run build` - プロダクションビルド
- test: `npm test` - ユニットテスト実行
- lint: `npm run lint` - ESLint実行

## ルール

@.github/rules/code-style.md  
@.github/rules/git-workflow.md  
@.github/rules/testing.md  
@.github/rules/security.md  
@.github/rules/documentation.md  

## Persistent Memory（自動知見蓄積）

以下のタイミングでPersistent Memory（MEMORY.md および関連ファイル）を更新すること：

- エラーを解決した時 → 「過去のトラブルと解決策」に記録
- 新しい設計判断をした時 → 「コードベースの重要な知見」に記録
- ユーザーの好みや方針がわかった時 → 「ユーザーの好み・スタイル」に記録
- 繰り返し使うコマンドやパターンを発見した時 → 「よく使うコマンド・パターン」に記録
- MEMORY.mdは200行以内に収める。詳細は別ファイルに分離してリンクする

## プロジェクト構造

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # ホームページ（記事一覧）
│   ├── story/[id]/page.tsx   # 記事詳細ページ
│   └── api/translate/        # API Routes（翻訳エンドポイント）
├── components/               # Reactコンポーネント
│   ├── StoryList.tsx         # 記事一覧
│   ├── StoryCard.tsx         # 記事カード
│   ├── StoryDetail.tsx       # 記事詳細
│   ├── TranslatedContent.tsx # 翻訳済みコンテンツ
│   └── Loading.tsx           # ローディングUI
├── lib/                      # ユーティリティ・ロジック
│   ├── hackernews.ts         # Hacker News API クライアント
│   ├── gemini.ts             # Google Gemini API クライアント
│   ├── cache.ts              # キャッシュ管理
│   └── types.ts              # 型定義
└── styles/
    └── globals.css           # グローバルスタイル
```

### 主要機能

1. **記事一覧表示**: Hacker Newsのトップストーリーを取得し一覧表示（キャッシュ: 5分）
2. **記事詳細表示**: 個別記事の詳細情報を表示
3. **要約生成**: Google Gemini APIで記事を要約
4. **日本語翻訳**: タイトルと内容を日本語に自動翻訳（キャッシュ: 24時間）

### 外部API

- **Hacker News API**: `https://hacker-news.firebaseio.com/v0` (認証不要)
- **Google Gemini API**: `https://generativelanguage.googleapis.com` (要APIキー)

### 環境変数

- `GEMINI_API_KEY`: Google Gemini APIキー（必須）

詳細な設計は @doc/architecture.md を参照
