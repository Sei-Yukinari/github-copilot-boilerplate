---
name: create-pr
description: 現在の変更内容からPRを作成する
disable-model-invocation: true
allowed-tools: "Read, Bash, Grep, Glob"
---

# /create-pr - PR作成

現在のブランチの変更内容からPull Requestを作成します。

## 実行手順

### 1. 変更内容の分析
```bash
git status
git diff --stat
git log --oneline main..HEAD  # or master..HEAD
```

### 2. PR情報の生成
- **タイトル**: Conventional Commits 形式（70文字以内）
  - `feat: 新機能の説明`
  - `fix: バグ修正の説明`
  - `refactor: リファクタリングの説明`
- **本文**:
  - 変更概要（箇条書き）
  - 変更理由
  - テスト結果（lint/type/test）
  - 影響範囲

### 3. PR作成前チェック
- lint/typecheck/testの実行結果確認
- 未コミットの変更がないか確認
- リモートにプッシュ済みか確認

### 4. PR作成
```bash
gh pr create --title "タイトル" --body "本文"
```

### 5. ブラウザで開く
PR作成後、必ずブラウザでPRを開く:
```bash
open <PR_URL>
```

## 出力形式

```
## PR作成完了

- URL: https://github.com/...
- タイトル: ...
- ブランチ: feature/... → main
- 変更ファイル数: N
```

## 注意事項
- `disable-model-invocation: true` により、ユーザーが `/create-pr` で明示的に実行した場合のみ動作
- AIが自動的にPRを作成することはない
