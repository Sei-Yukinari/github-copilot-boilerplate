# GitHub Copilot で使用される AI モデル

## 概要

GitHub Copilot は複数の AI モデルをサポートしており、用途に応じて最適なモデルを選択できます。

## コードレビューで使用されるモデル

GitHub Copilot のコードレビュー機能（`code_review` ツール）を使用する際、以下のモデルが利用可能です：

### デフォルトの動作

- **Auto（自動選択）**: GitHub Copilot はデフォルトで自動的に最適なモデルを選択します
- 可用性やレート制限を考慮して、状況に応じて最適なモデルが選ばれます
- ユーザーが明示的にモデルを指定しない場合、この自動選択が使用されます

### 利用可能なモデル

GitHub Copilot では以下のようなモデルから選択できます：

1. **GPT-4 系モデル**
   - GPT-4o: 汎用性の高いモデル
   - GPT-4o-mini: 軽量で高速なバージョン
   - GPT-5-Codex: コード専用に最適化

2. **Claude 系モデル**
   - Claude Sonnet 3.5: 高度な推論能力
   - Claude Sonnet 4.6: 最新版
   - Claude Opus 3.5: 最高性能

3. **o1 系モデル**
   - o1-preview: 複雑な推論タスク向け
   - o1-mini: 軽量版

4. **Gemini 系モデル**
   - Gemini 2.0 Flash: 高速処理
   - Gemini 1.5 Pro: 大規模コンテキスト対応

## モデルの選択方法

### IDE での選択（Visual Studio Code の例）

1. Copilot Chat ビューを開く
2. 画面下部の **CURRENT-MODEL** ドロップダウンメニューをクリック
3. 使用したいモデルを選択
4. "Auto" を選択すると、自動的に最適なモデルが選ばれます

### GitHub.com での選択

1. GitHub のページ右上の Copilot アイコンをクリック
2. チャット下部の **CURRENT-MODEL** ドロップダウンから選択

## コードレビュー機能の特徴

GitHub Copilot のコードレビュー機能は：

- PR の変更内容を自動的に分析
- セキュリティ、パフォーマンス、コード品質の観点からフィードバック
- 可能な場合は具体的な修正案を提供
- 選択されたモデル（または Auto 選択）を使用してレビューを実行

## モデルの性能比較

各モデルには異なる特性があります：

- **速度重視**: GPT-4o-mini, Gemini 2.0 Flash
- **精度重視**: Claude Opus 3.5, o1-preview
- **バランス型**: GPT-4o, Claude Sonnet 3.5
- **コード特化**: GPT-5-Codex 系

## プレミアムリクエストとコスト

モデルによって消費されるリクエスト数が異なります（マルチプライヤー）：

- 軽量モデル: 低コスト（例: o1-mini, GPT-4o-mini）
- 高性能モデル: 高コスト（例: o1-preview, Claude Opus）

詳細は [GitHub Copilot のリクエストについて](https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests) を参照してください。

## 参考リンク

- [GitHub Copilot でサポートされている AI モデル](https://docs.github.com/en/copilot/using-github-copilot/ai-models/supported-ai-models-in-copilot)
- [GitHub Copilot Chat の AI モデルを変更する](https://docs.github.com/en/copilot/using-github-copilot/ai-models/changing-the-ai-model-for-copilot-chat)
- [GitHub Copilot コードレビューを使用する](https://docs.github.com/en/copilot/using-github-copilot/code-review/using-copilot-code-review)
- [モデルの自動選択について](https://docs.github.com/en/copilot/concepts/auto-model-selection)

## 更新履歴

- 2026-02-18: 初版作成
