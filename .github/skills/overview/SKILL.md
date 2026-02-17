---
name: overview
description: プロジェクトの全体構造、主要ファイル、依存関係を素早く把握する
context: fork
agent: Explore
allowed-tools: "Read, Glob, Grep, Bash"
---

# /overview - プロジェクト俯瞰

プロジェクトの全体像を素早く把握して報告してください。

## 実行手順

### 1. ディレクトリ構造
- プロジェクトルートのディレクトリツリーを生成（深さ3まで）
- 主要ディレクトリの役割を説明

### 2. 依存関係の確認
以下のファイルを探して分析：
- `package.json` / `package-lock.json`
- `go.mod` / `go.sum`
- `requirements.txt` / `pyproject.toml` / `Pipfile`
- `Cargo.toml`
- `Gemfile`
- その他の依存管理ファイル

### 3. エントリポイントの特定
- メインエントリファイル
- 設定ファイル（tsconfig, webpack, vite, etc.）
- CI/CD設定

### 4. アーキテクチャ概要
- 使用フレームワーク
- ディレクトリパターン（MVC, Clean Architecture, etc.）
- 主要なモジュール/パッケージの関係

## 出力形式

```
## プロジェクト概要: [名前]

### 技術スタック
- 言語: ...
- フレームワーク: ...
- 主要ライブラリ: ...

### ディレクトリ構造
(ツリー表示)

### エントリポイント
- メイン: ...
- 設定: ...

### アーキテクチャ
- パターン: ...
- 説明: ...

### 主要コマンド
- dev: ...
- build: ...
- test: ...
```
