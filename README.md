# ✹ UNIMARK ✹

UNIMARK は、マークダウンをプレーンな HTML に出力して、コピペをするツールです。
これによって、マークダウンで書かれたテキストを、Confluence や Slack、Notion などのリッチテキストエディタに統一したスタイリングでコピペできます。

uni(唯一の)markdown から unimark としたのですが、ウニという文字が浮かんだので ✹ UNIMARK ✹ となりました

## 特徴

- マークダウンを HTML に変換（[marked.js](https://marked.js.org/)を使用）
- 統一したスタイリングでコピペ可能
- タブインデント機能付きエディタ
- `?markdown=` で、URL として Markdown を共有可能
- localStorage による一時保存

## 使い方

1. マークダウンテキストを入力
2. 変換ボタンを押す
3. 生成された HTML をコピー

### エディタの機能

- **タブインデント**: Tab キーで 2 スペースのインデントを挿入
- **複数行インデント**: 複数行を選択して Tab キーを押すと、選択した全ての行にインデントを適用
- **インデント解除**: Shift+Tab で 2 スペース分のインデントを解除

## 開発

### 必要要件

- Node.js >= 18
- npm >= 9

### セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/STYLE-PORT/tools-unimark
cd tools-unimark

# 依存パッケージのインストール
npm i
```

### 開発サーバーの起動

```bash
npm run dev
```

開発サーバーが http://localhost:5173 で起動します。

### ビルド

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

### プレビュー

```bash
npm run preview
```

ビルドされたアプリケーションをローカルでプレビューできます。

## デプロイ

GitHub Pages でホストしています。
`main` ブランチにプッシュすると自動的にデプロイされます。

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。
