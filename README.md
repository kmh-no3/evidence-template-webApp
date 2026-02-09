# Evidence Template WebApp（v0）

テスト項目表／証跡（スクリーンショット）一覧テンプレートを、**Webアプリで配布**するための最小構成です。

- 配布ファイル: `public/templates` 配下
- テンプレート一覧: `public/templates/manifest.json`
- 画面: `/`（ダウンロードボタン）
- テンプレート一覧（JSON）: `/templates/manifest.json`

## 1. ローカル起動（WSL/Windows どちらでもOK）

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 2. デプロイ（GitHub Pages）

GitHub Actions による自動デプロイが設定済みです。

### セットアップ手順

1. GitHubでリポジトリを作成し、Push
2. リポジトリの **Settings → Pages** を開く
3. **Source** を **GitHub Actions** に変更
4. `master` ブランチへPushすると自動でビルド＆デプロイされます

公開URL: `https://<ユーザー名>.github.io/<リポジトリ名>/`

> **Note:** basePath はワークフロー内でリポジトリ名から自動設定されます（`NEXT_PUBLIC_BASE_PATH`）。
> ローカル開発時（`npm run dev`）は basePath なし（ルート直下）で動作します。

### Vercel にデプロイする場合

- GitHubへPush
- VercelでImport
- ビルドコマンド: `npm run build`
- Output: Next.js（自動判定）

## 3. テンプレートの更新方法（v0運用）

1. `public/templates` にファイルを置き換え or 追加
2. `public/templates/manifest.json` を更新
   - `templates_version`
   - 各ファイルの `updated_at` / `sha256`
3. Pushして再デプロイ

> `sha256` はローカルで `sha256sum <file>` でも算出できます。

## 4. Webアプリ版への道筋（ロードマップ）

### Phase 0（今 / v0）: 配布のみ
- 静的テンプレートをWebからダウンロード
- manifestでバージョン管理
- GitHub + GitHub Pages で即公開

### Phase 1（テンプレ生成）
- 画面フォームに入力すると、**テンプレを自動生成**
  - 例: プロジェクト名、システム(DEV/QAS)、クライアント、対象(ZA/ZB/ZC)、版数
- 出力: xlsx / csv
- 実装案:
  - Next.js Route Handlerで `xlsx` を生成（ExcelJS等）
  - もしくは Python API（FastAPI）を別立てで生成

### Phase 2（証跡管理）
- スクショをアップロード→自動採番（EVI-xxx）→共有ストレージに保存
- テストIDに紐づけ、Excelにリンクを自動記載
- ストレージ: S3/SharePoint/Google Drive など

### Phase 3（品質強化）
- SoD/権限/監査観点のチェックリスト自動提案
- SAPの場合: 移送依頼番号から影響オブジェクト推定、回帰テスト候補の提案

## 5. SAPカスタマイズ向けテンプレの考え方

SAPのカスタマイズは「どのIMGノード／T-code／ビューをどう変えたか」「どの移送に載せたか」が重要です。
このため、SAP版テンプレには以下の列が追加されています:

- IMGパス（SPRO）/設定項目
- T-code
- 参照テーブル/ビュー
- 設定キー（例: BLART=ZA）
- 移送依頼番号
- システム/クライアント
- 設定差分（Before→After）

---

このリポジトリは、**テンプレ配布の土台**です。
要件が固まったら Phase 1（自動生成）まで一気に進めるのが最短です。
