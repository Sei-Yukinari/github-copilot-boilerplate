# Hacker News 翻訳サイト - システムアーキテクチャ設計書

## 1. システム概要

### 1.1 目的
Hacker NewsのトップストーリーをGoogle Gemini APIで要約・日本語翻訳し、読みやすい形式で提供するWebアプリケーション。

### 1.2 主要機能
- Hacker Newsトップストーリーの取得・表示
- 記事の要約生成
- 日本語への自動翻訳
- レスポンシブなUI/UX

---

## 2. システムアーキテクチャ

### 2.1 全体構成図

```mermaid
graph TB
    subgraph Client["Client Browser"]
        Frontend["Next.js Frontend (React)<br/>- Server Components (記事一覧・詳細)<br/>- Client Components (インタラクティブUI)"]
    end
    
    subgraph Server["Next.js Server (Node.js)"]
        AppRouter["App Router / API Routes<br/>- Server Actions (データ取得・処理)<br/>- API Routes (外部API統合)"]
    end
    
    subgraph ExternalAPIs["External APIs"]
        HN["Hacker News API<br/>(Firebase)<br/>- トップストーリー<br/>- 記事詳細"]
        Gemini["Google Gemini API<br/>- 要約生成<br/>- 翻訳"]
    end
    
    Frontend -->|HTTP/HTTPS| AppRouter
    AppRouter -->|GET /topstories.json<br/>GET /item/{id}.json| HN
    AppRouter -->|POST /generateContent| Gemini
    
    style Client fill:#e1f5ff
    style Server fill:#fff4e1
    style ExternalAPIs fill:#f0f0f0
```

### 2.2 技術スタック

| レイヤー | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| フロントエンド | Next.js | 14+ (App Router) | SSR/SSG、ルーティング |
| 言語 | TypeScript | 5.x | 型安全性 |
| UIライブラリ | React | 18+ | コンポーネントベース開発 |
| スタイリング | Tailwind CSS | 3.x | ユーティリティファースト CSS |
| HTTP クライアント | Fetch API | Native | API通信 |
| ランタイム | Node.js | 18+ | サーバーサイド実行 |

---

## 3. コンポーネント設計

### 3.1 ディレクトリ構造

```
claude-code-boilerplate/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # ホームページ（記事一覧）
│   │   ├── story/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 記事詳細ページ
│   │   └── api/                  # API Routes（必要に応じて）
│   │       └── translate/
│   │           └── route.ts      # 翻訳エンドポイント
│   ├── components/               # Reactコンポーネント
│   │   ├── StoryList.tsx         # 記事一覧コンポーネント
│   │   ├── StoryCard.tsx         # 記事カード
│   │   ├── StoryDetail.tsx       # 記事詳細
│   │   ├── TranslatedContent.tsx # 翻訳済みコンテンツ
│   │   └── Loading.tsx           # ローディングUI
│   ├── lib/                      # ユーティリティ・ロジック
│   │   ├── hackernews.ts         # Hacker News API クライアント
│   │   ├── gemini.ts             # Google Gemini API クライアント
│   │   ├── cache.ts              # キャッシュ管理
│   │   └── types.ts              # 型定義
│   └── styles/
│       └── globals.css           # グローバルスタイル
├── public/                       # 静的ファイル
├── doc/                          # ドキュメント
│   └── architecture.md           # このファイル
├── .env.local.example            # 環境変数テンプレート
├── next.config.js                # Next.js設定
├── tailwind.config.js            # Tailwind CSS設定
├── tsconfig.json                 # TypeScript設定
└── package.json                  # 依存関係
```

### 3.2 主要コンポーネント

#### 3.2.1 Server Components（サーバーサイドレンダリング）
- `app/page.tsx`: トップストーリー一覧ページ
- `app/story/[id]/page.tsx`: 記事詳細ページ

#### 3.2.2 Client Components（クライアントサイドインタラクション）
- `StoryCard.tsx`: 記事カード（ホバー効果、クリックイベント）
- `TranslatedContent.tsx`: 翻訳コンテンツ（展開/折りたたみ）

---

## 4. データフロー

### 4.1 記事一覧取得フロー

```
User Request
    ↓
Next.js Server (app/page.tsx)
    ↓
lib/hackernews.ts: getTopStories()
    ↓
Hacker News API: /v0/topstories.json
    ↓
[記事ID配列を取得]
    ↓
lib/hackernews.ts: getStoryDetails(ids)
    ↓
Hacker News API: /v0/item/{id}.json (並列リクエスト)
    ↓
[記事詳細データを取得]
    ↓
Next.js Server (データをキャッシュ: 5分)
    ↓
Client Browser (HTML/React レンダリング)
```

### 4.2 記事翻訳フロー

```
User clicks Story Card
    ↓
Navigate to /story/[id]
    ↓
Next.js Server (app/story/[id]/page.tsx)
    ↓
lib/hackernews.ts: getStoryDetails(id)
    ↓
Hacker News API: /v0/item/{id}.json
    ↓
[記事データ取得]
    ↓
lib/gemini.ts: translateAndSummarize(story)
    ↓
Google Gemini API: POST /v1/models/gemini-pro:generateContent
    ↓
[要約 + 翻訳テキストを生成]
    ↓
Next.js Server (翻訳結果をキャッシュ: 24時間)
    ↓
Client Browser (翻訳済みコンテンツを表示)
```

---

## 5. 外部API統合

### 5.1 Hacker News API

#### エンドポイント
- **Base URL**: `https://hacker-news.firebaseio.com/v0`
- **トップストーリー**: `GET /topstories.json`
  - レスポンス: `[ID配列]` (最大500件)
- **記事詳細**: `GET /item/{id}.json`
  - レスポンス: `{ id, type, by, time, title, url, score, descendants, ... }`

#### 制約・考慮事項
- 認証不要
- レート制限なし（実質）
- 記事本文は含まれない（`url` フィールドからリンク先へ）
- コメント情報は `kids` フィールドに含まれる

#### 実装方針
**Phase 1（簡易版）**: タイトルとURLのみ翻訳
**Phase 2（拡張版）**: リンク先URLをスクレイピングして本文も翻訳

### 5.2 Google Gemini API

#### エンドポイント
- **Base URL**: `https://generativelanguage.googleapis.com`
- **テキスト生成**: `POST /v1/models/gemini-pro:generateContent`

#### 認証
- APIキー方式: `?key=YOUR_API_KEY`
- 環境変数 `GEMINI_API_KEY` で管理

#### リクエストボディ例
```json
{
  "contents": [{
    "parts": [{
      "text": "以下のHacker Newsの記事を要約し、日本語に翻訳してください:\n\nTitle: ...\nURL: ..."
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1024
  }
}
```

#### レート制限
- 無料枠: 60 requests/min
- 有料プラン: より高いレート制限

#### エラーハンドリング
- 429 Too Many Requests → リトライ（exponential backoff）
- 400 Bad Request → プロンプト調整
- 500 Internal Server Error → リトライ（最大3回）

---

## 6. キャッシュ戦略

### 6.1 Next.js Data Cache

Next.js 14のApp Routerでは、`fetch()`のレスポンスが自動的にキャッシュされます。

#### 記事一覧（トップストーリー）
```typescript
// 5分間キャッシュ
const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
  next: { revalidate: 300 } // 5分
});
```

#### 記事詳細
```typescript
// 1時間キャッシュ
const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
  next: { revalidate: 3600 } // 1時間
});
```

#### 翻訳結果
```typescript
// 24時間キャッシュ（翻訳は変わらないため）
const translation = await translateAndSummarize(story);
// キャッシュはNext.jsのData Cacheで自動管理
```

### 6.2 将来的な拡張（オプション）
- Vercel KVやRedisを使った外部キャッシュ
- ユーザーごとのお気に入り管理（要データベース）

---

## 7. エラーハンドリング戦略

### 7.1 エラータイプと対応

| エラータイプ | 原因 | 対応 |
|-------------|------|------|
| Network Error | API接続失敗 | リトライ（3回まで）→ エラーメッセージ表示 |
| API Rate Limit | Gemini APIレート制限 | Exponential backoff → キューイング |
| Invalid API Key | 環境変数未設定 | サーバー起動時にバリデーション |
| 404 Not Found | 存在しない記事ID | エラーページ表示 |
| Timeout | レスポンス遅延 | 30秒でタイムアウト → リトライ |

### 7.2 実装パターン

```typescript
// lib/gemini.ts
export async function translateAndSummarize(story: Story): Promise<TranslatedStory> {
  try {
    const response = await fetchWithRetry(GEMINI_API_URL, {
      method: 'POST',
      body: JSON.stringify(buildPrompt(story)),
      timeout: 30000,
      retries: 3
    });
    
    return parseResponse(response);
  } catch (error) {
    if (error instanceof RateLimitError) {
      // レート制限エラー: 指数バックオフ
      await exponentialBackoff(error.retryAfter);
      return translateAndSummarize(story); // リトライ
    }
    
    // その他のエラー: ログ記録 + フォールバック
    console.error('Translation failed:', error);
    return {
      ...story,
      summary: '要約の生成に失敗しました',
      translatedTitle: story.title,
      error: error.message
    };
  }
}
```

---

## 8. セキュリティ設計

### 8.1 APIキー管理

#### 環境変数による管理
```bash
# .env.local (gitignoreに追加)
GEMINI_API_KEY=your_api_key_here
```

#### サーバーサイドでのみ使用
- APIキーはクライアントに露出しない
- Server ComponentsまたはAPI Routesでのみアクセス
- `process.env.GEMINI_API_KEY`

#### 起動時バリデーション
```typescript
// lib/gemini.ts
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}
```

### 8.2 XSS対策

- Reactのデフォルトエスケープ機能を活用
- `dangerouslySetInnerHTML`は使用しない
- ユーザー入力は存在しないため、追加対策不要

### 8.3 CORS設定

- Next.js API Routesはデフォルトで同一オリジン
- 外部からのAPIアクセスは不要（今回のケース）

---

## 9. パフォーマンス最適化

### 9.1 Server Components活用

- 記事一覧・詳細ページはServer Componentsで実装
- データ取得はサーバーサイドで完結（クライアントJavaScript削減）

### 9.2 並列データ取得

```typescript
// 複数記事を並列取得
const storyPromises = topStoryIds.slice(0, 30).map(id => getStoryDetails(id));
const stories = await Promise.all(storyPromises);
```

### 9.3 画像最適化

- Next.jsの`<Image>`コンポーネント使用
- 自動的なWebP変換・遅延読み込み

### 9.4 コード分割

- Dynamic Imports for client components
```typescript
const InteractiveComponent = dynamic(() => import('./InteractiveComponent'), {
  loading: () => <Skeleton />
});
```

### 9.5 Streaming SSR

- React Suspenseを活用した段階的レンダリング
```tsx
<Suspense fallback={<LoadingSpinner />}>
  <StoryList />
</Suspense>
```

---

## 10. 非機能要件

### 10.1 パフォーマンス
- 記事一覧の初回表示: 2秒以内
- 記事詳細の翻訳表示: 5秒以内
- Lighthouse Score: 90以上（Performance）

### 10.2 可用性
- 外部API障害時もエラーメッセージで適切に対応
- タイムアウト設定でハングを防止

### 10.3 スケーラビリティ
- Vercelのエッジネットワークによる世界展開
- Gemini APIのレート制限内での運用

### 10.4 保守性
- TypeScriptによる型安全性
- コンポーネント単位での責務分離
- ESLint + Prettierでコード品質維持

---

## 11. デプロイ戦略

### 11.1 推奨プラットフォーム: Vercel

#### メリット
- Next.jsとの完全統合
- 自動ビルド・デプロイ
- エッジネットワーク（CDN）
- 環境変数管理

#### デプロイフロー
```
GitHub push (main branch)
    ↓
Vercel Auto Build
    ↓
Production Deploy
    ↓
https://your-app.vercel.app
```

### 11.2 環境変数設定

Vercel Dashboardで以下を設定:
- `GEMINI_API_KEY`: Google Gemini APIキー
- `NODE_ENV`: `production`

### 11.3 代替プラットフォーム
- Netlify
- AWS Amplify
- Google Cloud Run

---

## 12. 今後の拡張案

### Phase 3: 機能拡張
- [ ] コメントの翻訳
- [ ] カテゴリ別フィルタリング
- [ ] 検索機能
- [ ] お気に入り機能（要ユーザー認証）

### Phase 4: パフォーマンス改善
- [ ] Vercel KVによる翻訳キャッシュ
- [ ] WebSocketでのリアルタイム更新
- [ ] Progressive Web App (PWA) 対応

### Phase 5: 多言語対応
- [ ] 英語以外の言語への翻訳（中国語、スペイン語等）
- [ ] 言語選択UI

---

## 13. 参考資料

- [Hacker News API Documentation](https://github.com/HackerNews/API)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Vercel Deployment Guide](https://vercel.com/docs)
