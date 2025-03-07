# ✹ UNIMARK ✹

UNIMARK は、マークダウンをプレーンな HTML に出力して、コピペをするツールです。
これによって、マークダウンで書かれたテキストを、Confluence や Slack、Notion などのリッチテキストエディタに統一したスタイリングでコピペできます。

universal-markdown から unimark と命名したら、ウニという文字が浮かんだので ✹ UNIMARK ✹ となりました

## 特徴

- マークダウンを HTML に変換（[marked.js](https://marked.js.org/)を使用）
- XSS 対策済み（[DOMPurify](https://github.com/cure53/DOMPurify)を使用）
- 統一したスタイリングでコピペ可能
- タブインデント機能付きエディタ
- モバイルフレンドリーなレスポンシブデザイン

## 使い方

1. マークダウンテキストを入力
2. 変換ボタンを押す
3. 生成された HTML をコピー

### エディタの機能

- **タブインデント**: Tab キーで 4 スペースのインデントを挿入
- **複数行インデント**: 複数行を選択して Tab キーを押すと、選択した全ての行にインデントを適用
- **インデント解除**: Shift+Tab で 4 スペース分のインデントを解除

## 技術スタック

- **フロントエンド**
  - React 18
  - TypeScript
  - Vite
  - TailwindCSS
- **マークダウン変換**
  - marked.js
  - DOMPurify（セキュリティ対策）
- **開発ツール**
  - ESLint
  - SWC（高速ビルド）

## 開発

### 必要要件

- Node.js >= 18
- npm >= 9

### セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/unimark.git
cd unimark

# 依存パッケージのインストール
npm install
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

## 謝辞

- [marked.js](https://marked.js.org/) - マークダウンパーサー
- [DOMPurify](https://github.com/cure53/DOMPurify) - XSS 対策
- [React](https://reactjs.org/) - UI ライブラリ
- [Vite](https://vitejs.dev/) - ビルドツール
- [TailwindCSS](https://tailwindcss.com/) - CSS フレームワーク
