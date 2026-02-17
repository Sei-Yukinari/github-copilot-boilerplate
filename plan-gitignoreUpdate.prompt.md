## Plan: .gitignore整備

このリポジトリの実態に合わせて`.gitignore`を整え、Next.js/Node、IDE、OS、環境設定、ビルド生成物を漏れなくカバーするための更新方針を整理します。まず既存`.gitignore`を点検し、プロジェクト構成と依存関係に基づく無視対象を洗い出して、必要な追加・整理項目を短いリストにまとめます。

### Steps 4 steps, 5–20 words each
1. 既存の[`.gitignore`](/Users/sei-yukinari/work/try-vibe-coding/github-copilot-boilerplate/.gitignore)内容と現在の無視対象を棚卸しする。  
2. Next.js/Nodeの標準無視対象（`node_modules`, `.next`, `dist`等）を洗い出す。  
3. IDE・OS・環境設定ファイル（例: `.idea`, `.vscode`, `.env*`）の整理方針を決める。  
4. 追加・除外の最終候補を短いセクション構成にまとめる。  

### Further Considerations 2 items, 5–25 words each
1. `.env.local`等は全無視にする？例外で`.env.example`のみ追跡にする案はOK？  
2. 生成物の範囲はどこまで？Next.js以外のビルドやツール出力も含める？

