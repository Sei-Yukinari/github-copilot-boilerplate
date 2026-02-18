# GitHub Copilot 設定

このディレクトリには、GitHub Copilot 用の設定ファイルが含まれています。

## 構成

```
.github/
├── README.md          # このファイル
├── agents/            # 専門家エージェント（役割定義）
│   ├── reviewer.md    # コードレビュー専門家
│   ├── architect.md   # アーキテクチャ設計専門家
│   ├── test-writer.md # テスト作成専門家
│   └── debugger.md    # デバッグ専門家
└── rules/             # プロジェクト規約
    ├── code-style.md      # コーディングスタイル
    ├── git-workflow.md    # Gitワークフロー
    ├── testing.md         # テスト規約
    ├── security.md        # セキュリティルール
    └── documentation.md   # ドキュメント規約
```

## Agents（専門家エージェント）

各エージェントファイルには、特定の役割を担うエージェントの指示が含まれています。

- **reviewer**: コードレビュー（品質、セキュリティ、パフォーマンス）
- **architect**: アーキテクチャ設計、技術選定、リファクタリング計画
- **test-writer**: テスト設計・実装
- **debugger**: バグの根本原因分析と修正方針提案

### 使い方

GitHub Copilot で、自然に依頼するだけです：

```
「このPRをレビューして」→ reviewer の視点で分析
「認証機能の設計を考えて」→ architect の視点で提案
「このファイルのテストを書いて」→ test-writer の視点で実装
「このエラーの原因を調べて」→ debugger の視点で調査
```

## Rules（プロジェクト規約）

プロジェクト全体で適用されるルールと規約です。GitHub Copilot は、これらのルールを参照してコード提案やレビューを行います。

- **code-style**: コーディングスタイルガイドライン
- **git-workflow**: ブランチ戦略、コミットメッセージ規約
- **testing**: テストの書き方、構造、実行方針
- **security**: セキュリティに関する重要なルール
- **documentation**: ドキュメンテーション規約

## GitHub Copilot での利用

### メイン設定ファイル

プロジェクトルートの `Agent.md` が GitHub Copilot のメイン設定ファイルです。このファイルには：

- プロジェクト概要
- 技術スタック
- 主要コマンド
- プロジェクト構造
- `.github/agents/` と `.github/rules/` への参照

が含まれています。

### 自動読み込み

GitHub Copilot は、プロジェクトのコンテキストとして以下を自動的に参照します：

1. ルートの `Agent.md`（メイン instructions）
2. `.github/agents/*.md`（必要に応じて）
3. `.github/rules/*.md`（関連するファイル操作時）

## AI モデルについて

GitHub Copilot は複数の AI モデル（GPT-4o, Claude Sonnet, o1, Gemini など）をサポートしています。

- デフォルトでは **Auto（自動選択）** が使用され、最適なモデルが自動的に選ばれます
- コードレビュー時も同様に、選択されたモデル（または Auto）が使用されます
- IDE の Copilot Chat でモデルを切り替えることも可能です

詳細は [`/doc/copilot-models.md`](../doc/copilot-models.md) を参照してください。

## Claude Code との共存

このプロジェクトは、Claude Code の `.claude` ディレクトリと GitHub Copilot の `.github` ディレクトリを両方保持しています。

- **Claude Code**: `.claude/` 配下の設定を使用
- **GitHub Copilot**: `.github/` 配下の設定と `Agent.md` を使用

両ツールで同様の開発体験が得られるよう、設定内容は可能な限り同期されています。

## カスタマイズ

プロジェクトに合わせて、各ファイルを自由に編集してください：

1. **agents/*.md**: エージェントの役割や分析観点を調整
2. **rules/*.md**: プロジェクト固有の規約を追加・変更
3. **Agent.md**: プロジェクト情報を最新に保つ

---

詳細は各ファイルを参照してください。
