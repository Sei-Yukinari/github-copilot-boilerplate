# フロントエンド開発ルール (Next.js + React)

このファイルはNext.js 14+ (App Router) + React 18+を使用したフロントエンド開発のルールを定義します。

## コンポーネント設計

### Server Components vs Client Components

**デフォルトはServer Components**: `"use client"` は必要な場合のみ使用

**Client Componentsが必要な場合**:
- `useState`, `useEffect` などのReact Hooks使用時
- イベントハンドラー（`onClick`, `onChange`等）使用時
- ブラウザAPI（`window`, `localStorage`等）使用時
- Context API使用時

```typescript
// Server Component（デフォルト）
export default async function StoryList() {
  const stories = await fetchStories()
  return <div>{stories.map(s => <StoryCard key={s.id} story={s} />)}</div>
}

// Client Component（必要な場合のみ）
"use client"
export function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("")
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

### Propsの設計原則

- **Props型は必ず定義**: `interface` または `type` で明示
- **childrenは`ReactNode`型**: 子要素を受け取る場合
- **コールバックは`onXxx`命名**: イベントハンドラーの命名規則
- **オプショナルProps**: デフォルト値を設定

```typescript
interface StoryCardProps {
  story: Story
  onSelect?: (id: number) => void
  variant?: "compact" | "detailed"
  children?: ReactNode
}

export function StoryCard({ 
  story, 
  onSelect, 
  variant = "compact",
  children 
}: StoryCardProps) {
  // 実装
}
```

### コンポーネント分割の原則

- **1ファイル1コンポーネント**: 小規模な補助コンポーネントは同じファイルでも可
- **100行以内を目安**: それ以上は分割を検討
- **再利用性**: 3回以上使う場合は共通コンポーネント化
- **責務の分離**: UIロジックとビジネスロジックを分離

```
components/
├── ui/              # 汎用UIコンポーネント（Button, Card等）
├── features/        # 機能単位のコンポーネント（StoryList, CommentSection等）
└── layouts/         # レイアウトコンポーネント（Header, Footer等）
```

## Next.js App Router規約

### ディレクトリ構造

```
app/
├── layout.tsx           # ルートレイアウト
├── page.tsx             # ホームページ
├── loading.tsx          # ローディングUI
├── error.tsx            # エラーUI
├── not-found.tsx        # 404ページ
├── [dynamic]/           # 動的ルート
│   └── page.tsx
└── api/                 # API Routes
    └── [endpoint]/
        └── route.ts
```

### データフェッチング戦略

**Server Componentsでのデータ取得**:
```typescript
// app/page.tsx
export default async function Page() {
  // Server Componentで直接fetch
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 300 } // 5分キャッシュ
  })
  return <div>{/* レンダリング */}</div>
}
```

**キャッシュ戦略**:
- `{ cache: 'force-cache' }`: 永続キャッシュ（デフォルト）
- `{ cache: 'no-store' }`: キャッシュなし（動的データ）
- `{ next: { revalidate: 秒数 } }`: 指定秒数でキャッシュ再検証

**並列データフェッチング**:
```typescript
// 複数のfetchを並列実行
const [stories, comments] = await Promise.all([
  fetchStories(),
  fetchComments()
])
```

### メタデータ管理

```typescript
// app/page.tsx
export const metadata: Metadata = {
  title: 'ページタイトル',
  description: 'ページ説明',
  openGraph: {
    title: 'OGタイトル',
    description: 'OG説明'
  }
}
```

## 状態管理

### React Hooks使用ガイドライン

**useState**: ローカル状態管理
```typescript
const [count, setCount] = useState(0)
const [user, setUser] = useState<User | null>(null)
```

**useEffect**: 副作用処理（最小限に）
```typescript
useEffect(() => {
  // 依存配列を必ず指定
  const timer = setInterval(() => {}, 1000)
  return () => clearInterval(timer) // クリーンアップ必須
}, [dependency])
```

**useMemo / useCallback**: パフォーマンス最適化（必要な場合のみ）
```typescript
const expensiveValue = useMemo(() => computeExpensive(data), [data])
const memoizedCallback = useCallback(() => doSomething(), [dependency])
```

### Context API使用方針

**グローバル状態が必要な場合のみ使用**: テーマ、認証状態、言語設定等

```typescript
// lib/contexts/ThemeContext.tsx
"use client"
const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
```

## パフォーマンス最適化

### 画像最適化

**必ず`next/image`を使用**: 自動最適化、遅延読み込み

```typescript
import Image from "next/image"

<Image 
  src="/hero.jpg" 
  alt="Hero画像"
  width={800}
  height={600}
  priority={true} // LCPの場合
/>
```

### 動的インポート（Code Splitting）

**重いコンポーネントは遅延読み込み**:
```typescript
import dynamic from "next/dynamic"

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <p>Loading...</p>,
  ssr: false // CSRのみの場合
})
```

### React.memoの使用判断

**必要な場合のみ使用**: 計測してから最適化

```typescript
export const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  // 重い処理
}, (prevProps, nextProps) => {
  // カスタム比較関数（必要な場合）
  return prevProps.data.id === nextProps.data.id
})
```

## スタイリング規約（Tailwind CSS）

### クラス名の順序

Tailwind公式推奨順序: レイアウト → ボックスモデル → タイポグラフィ → ビジュアル → その他

```typescript
<div className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-md hover:shadow-lg">
```

### カスタムスタイルの追加

**tailwind.config.jsでカスタマイズ**: インラインスタイルは避ける

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6'
      }
    }
  }
}
```

### レスポンシブデザイン

**モバイルファースト**: デフォルトはモバイル、ブレークポイントで拡張

```typescript
<div className="text-sm md:text-base lg:text-lg">
  <h1 className="text-2xl md:text-4xl">タイトル</h1>
</div>
```

### 条件付きスタイリング

**clsxまたはcn()ユーティリティ使用**:
```typescript
import { clsx } from "clsx"

<button className={clsx(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

## アクセシビリティ（a11y）

### セマンティックHTML

**適切なHTML要素を使用**:
```typescript
// 良い例
<nav><ul><li><a href="/">ホーム</a></li></ul></nav>
<main><article><h1>タイトル</h1></article></main>

// 悪い例
<div onClick={goHome}>ホーム</div> // buttonを使うべき
```

### ARIA属性

**必要な場合のみ追加**: 適切なHTMLで解決できる場合は不要

```typescript
<button
  aria-label="メニューを開く"
  aria-expanded={isOpen}
  aria-controls="mobile-menu"
>
  <MenuIcon />
</button>

<div id="mobile-menu" role="menu" aria-labelledby="menu-button">
```

### キーボード操作

**すべてのインタラクティブ要素はキーボード操作可能に**:
```typescript
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === "Enter" && handleClick()}
>
```

### カラーコントラスト

Tailwindのデフォルトカラーは概ねWCAG AA準拠、重要なテキストはAAA基準を目指す

## 型安全性

### Props型定義

```typescript
// 基本
interface ButtonProps {
  variant: "primary" | "secondary"
  size?: "sm" | "md" | "lg"
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}

// 拡張: ネイティブHTML属性を継承
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}
```

### Genericsの活用

```typescript
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => ReactNode
  keyExtractor: (item: T) => string | number
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return <>{items.map(item => <div key={keyExtractor(item)}>{renderItem(item)}</div>)}</>
}
```

### API型定義

```typescript
// lib/types.ts
export interface Story {
  id: number
  title: string
  url?: string
  score: number
  by: string
  time: number
}

export interface ApiResponse<T> {
  data: T
  error?: string
}
```

## エラーハンドリング

### Error Boundary

```typescript
// app/error.tsx
"use client"

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={reset}>再試行</button>
    </div>
  )
}
```

### 非同期エラー処理

```typescript
"use client"

export function DataComponent() {
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    fetchData()
      .catch(err => {
        console.error("データ取得失敗:", err)
        setError(err)
      })
  }, [])
  
  if (error) return <ErrorMessage error={error} />
  // 正常系
}
```

### Loading / Suspense

```typescript
// app/loading.tsx
export default function Loading() {
  return <div>読み込み中...</div>
}

// または Suspense境界
<Suspense fallback={<LoadingSpinner />}>
  <AsyncComponent />
</Suspense>
```

## フォーム処理

### Server Actions活用

```typescript
// app/actions.ts
"use server"

export async function submitForm(formData: FormData) {
  const name = formData.get("name") as string
  // バリデーション
  if (!name) throw new Error("名前は必須です")
  // 処理
  await saveToDatabase({ name })
  revalidatePath("/")
  return { success: true }
}

// app/form.tsx
"use client"
import { submitForm } from "./actions"

export function Form() {
  return (
    <form action={submitForm}>
      <input name="name" required />
      <button type="submit">送信</button>
    </form>
  )
}
```

### クライアントサイドバリデーション

```typescript
const [errors, setErrors] = useState<Record<string, string>>({})

function validateForm(data: FormData): boolean {
  const newErrors: Record<string, string> = {}
  if (!data.email) newErrors.email = "メールアドレスは必須です"
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

## テスト戦略

詳細は @.github/rules/testing.md を参照。フロントエンド固有の追加事項：

### React Testing Library

```typescript
import { render, screen, fireEvent } from "@testing-library/react"

test("ボタンクリックでカウントアップ", () => {
  render(<Counter />)
  const button = screen.getByRole("button", { name: /increment/i })
  fireEvent.click(button)
  expect(screen.getByText("Count: 1")).toBeInTheDocument()
})
```

### Server Componentsのテスト

Server Componentsは単体テストではなく、E2Eテスト（Playwright等）で検証推奨

## 参考

- Next.js公式ドキュメント: https://nextjs.org/docs
- React公式ドキュメント: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- React Testing Library: https://testing-library.com/react
