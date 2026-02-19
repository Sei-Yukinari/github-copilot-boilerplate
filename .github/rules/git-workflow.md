# Git ワークフロー

このプロジェクトのGitワークフロー規約です。

## ブランチ戦略

- **ブランチ命名**:
  - `feature/<description>` - 新機能開発
  - `fix/<description>` - バグ修正
  - `chore/<description>` - 雑務（依存更新、設定変更等）

## コミットメッセージ

Conventional Commits 形式を使用：

- `feat:` - 新機能追加
- `fix:` - バグ修正
- `chore:` - 雑務
- `docs:` - ドキュメント変更
- `refactor:` - リファクタリング
- `test:` - テスト追加・修正

例：`feat: Google Gemini API統合を追加`

## ワークフロー

1. mainブランチから作業ブランチを作成
2. 小さく論理的な単位でコミット
3. PR作成前に lint/test が通ることを確認
4. PRでレビューを受ける
5. mainブランチへの直接pushは禁止

## 原則

- コミットは論理的単位で小さく
- コミットメッセージは変更内容を明確に
- 1つのPRは1つの目的に集中
