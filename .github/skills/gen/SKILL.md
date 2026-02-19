---
name: gen
description: プロジェクトの既存パターンに従ったコード（コンポーネント、API、モデル等）を生成する
argument-hint: '[type] [name] (e.g. component Button, api users)'
allowed-tools: 'Read, Glob, Grep, Write, Edit'
---

# /gen - パターン準拠コード生成

プロジェクトの既存パターンに従って新しいコードを生成します。

## 引数

- `$ARGUMENTS` から生成タイプと名前を取得
- 例: `/gen component Button`, `/gen api users`, `/gen model User`

## 実行手順

### 1. パターン検出

同じタイプの既存コードを探して、以下のパターンを抽出：

- ファイル命名規則（kebab-case, PascalCase等）
- ディレクトリ配置
- インポート構文
- エクスポートパターン
- コード構造（関数型/クラス型等）
- 付随ファイル（index.ts, types.ts, styles等）

### 2. コード生成

検出したパターンに厳密に従って新しいコードを生成：

- 命名規則を統一
- インポートパスを正確に
- 既存コードと同じ構造
- TypeScript の場合は型定義も

### 3. 関連ファイル更新

- バレルファイル（index.ts）への追加
- ルーティング設定への追加（該当する場合）
- その他の登録ファイル

## 注意事項

- 既存パターンが見つからない場合は、一般的なベストプラクティスに従う
- 生成前にユーザーに確認（ファイルパス、構造）
- 過度な抽象化を避け、シンプルに保つ
