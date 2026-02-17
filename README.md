# AI Code Assistant Boilerplate

GitHub Copilot に対応した、開発最適化ボイラープレート。

## 対応ツール

- **GitHub Copilot**: `.github/` 配下の設定と `Agent.md` を使用


## 構成

```
.claude/
├── settings.json              # チーム共有設定（permissions, hooks）
├── settings.local.json        # 個人設定（.gitignore対象）
├── settings.local.json.example # settings.local.json のテンプレート
├── CLAUDE.md                  # .claude内メモリ
│
├── agents/                    # 専門家エージェント
│   ├── reviewer.md            #   コードレビュー
│   ├── architect.md           #   設計・アーキテクチャ
│   ├── test-writer.md         #   テスト作成
│   └── debugger.md            #   デバッグ
│
├── skills/                    # カスタムスキル
│   ├── overview/              #   /overview - プロジェクト俯瞰
│   ├── gen/                   #   /gen - コード生成
│   ├── add-test/              #   /add-test - テスト追加
│   ├── create-pr/             #   /create-pr - PR作成
│   ├── check/                 #   /check - 品質チェック
│   ├── troubleshoot/          #   /troubleshoot - エラー解決
│   └── doc/                   #   /doc - ドキュメント生成
│
├── rules/                     # 自動適用ルール
│   ├── code-style.md          #   コーディングスタイル
│   ├── git-workflow.md        #   Gitワークフロー
│   ├── testing.md             #   テスト規約
│   ├── security.md            #   セキュリティ
│   └── documentation.md       #   ドキュメント規約
│
├── hooks/                     # 自動実行スクリプト
│   └── protect-files.sh       #   機密ファイル保護
│
└── agent-memory/              # サブエージェント永続メモリ（自動生成）
    ├── reviewer/MEMORY.md
    ├── architect/MEMORY.md
    ├── debugger/MEMORY.md
    └── test-writer/MEMORY.md
```

## 機能詳細

### Agents（専門家エージェント）

Claudeが自動的にタスクを委譲する専門家エージェント。メインのコンテキストを消費しません。
各エージェントは永続メモリ（`memory: project`）を持ち、開発中の知見をセッションを跨いで自動蓄積します。メモリは `.claude/agent-memory/<agent名>/MEMORY.md` に保存され、git管理でチームに共有できます（初回のエージェント実行時に自動生成）。

| エージェント  | 役割                                          | モデル | メモリに蓄積する知見           |
| ------------- | --------------------------------------------- | ------ | ------------------------------ |
| `reviewer`    | コードレビュー（OWASP、パフォーマンス、品質） | sonnet | コーディングパターン、頻出問題 |
| `architect`   | 設計・アーキテクチャ分析・技術選定            | opus   | 設計判断の理由、モジュール構造 |
| `test-writer` | テスト設計・実装・実行                        | sonnet | テストパターン、モック手法     |
| `debugger`    | 系統的デバッグ・根本原因分析                  | opus   | バグ原因と解決策、環境トラブル |

**使い方**: 自然に依頼するだけで自動委譲されます。

```
「このPRをレビューして」→ reviewer
「認証機能の設計を考えて」→ architect
「このファイルのテストを書いて」→ test-writer
「このエラーの原因を調べて」→ debugger
```

### Skills（カスタムスキル）

Skills は Claude Code のカスタムアクション機能です。旧来のスラッシュコマンド（`.claude/commands/`）はSkillsに統合されました。

**2つの実行方法:**

- **`/command`（ユーザー明示実行）**: チャットで `/overview` のようにスラッシュコマンドとして直接呼び出す
- **AI自動実行**: Claudeが会話の文脈から必要と判断した場合に自動的に実行する（`create-pr` のように無効化も可能）

| コマンド                | 説明                           |    AI自動実行     |
| ----------------------- | ------------------------------ | :---------------: |
| `/overview`             | プロジェクト全体の構造を把握   |         ○         |
| `/gen [type] [name]`    | 既存パターンに従ったコード生成 |         ○         |
| `/add-test [file]`      | テストの自動生成・実行         |         ○         |
| `/create-pr`            | PR作成                         | ✗（明示実行のみ） |
| `/check`                | lint/typecheck/test一括実行    |         ○         |
| `/troubleshoot [error]` | エラー原因の特定・修正案       |         ○         |
| `/doc [target]`         | ドキュメント生成               |         ○         |

### Rules（自動適用ルール）

セッション開始時に自動読み込み。関連ファイル操作時にコンテキストとして適用されます。

- **code-style.md**: コーディングスタイル（全ファイル）
- **git-workflow.md**: Gitワークフロー規約（全ファイル）
- **testing.md**: テスト規約（テストファイルのみ）
- **security.md**: セキュリティルール（全ファイル）
- **documentation.md**: ドキュメント規約（全ファイル）

### Hooks（自動実行）

| タイミング     | 処理                               |
| -------------- | ---------------------------------- |
| ファイル編集前 | 機密ファイル・ロックファイルの保護 |
| ファイル編集後 | Prettier自動フォーマット           |

### Settings（権限設定）

- **allow**: パッケージマネージャーのrun系コマンド、git読み取り系
- **deny**: 危険なコマンド、機密ファイルの読み取り
- **ask**: git push、merge、npm publish等

## カスタマイズ

### Claude Code の場合

#### 1. CLAUDE.md の編集

プロジェクト固有の情報を記入してください：

- プロジェクト名・概要
- 技術スタック
- 主要コマンド（dev, build, test, lint）
- プロジェクト構造

#### 2. Rules の調整

`.claude/rules/` 内のファイルをプロジェクトの規約に合わせて編集してください。

#### 3. Settings の調整

`.claude/settings.json` の permissions をプロジェクトに合わせて調整してください。

### GitHub Copilot の場合

#### 1. Agent.md の編集

ルートの `Agent.md` をプロジェクトに合わせて編集してください：

- プロジェクト名・概要
- 技術スタック
- 主要コマンド（dev, build, test, lint）
- プロジェクト構造

#### 2. Agents の調整

`.github/agents/` 内のファイルをプロジェクトに合わせて調整できます。

#### 3. Rules の調整

`.github/rules/` 内のファイルをプロジェクトの規約に合わせて編集してください。

## 詳細
- **GitHub Copilot 設定**: `.github/README.md` を参照

## License

MIT
