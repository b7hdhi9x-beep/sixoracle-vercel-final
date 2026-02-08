# 六神ノ間 - Six Oracle (Vercel Lite)

AI占いサブスクリプションサービスの軽量Vercel版。

## 技術スタック

- **Next.js 14** (App Router)
- **Tailwind CSS 3**
- **Framer Motion** (アニメーション)
- **Google Gemini API** (AI占い)
- **LocalStorage** (チャット履歴)
- **PWA対応**

## 機能

- 11人のAI占い師とのチャット
- 無料トライアル（1日3回）/ プレミアム（無制限）
- チャット履歴のローカル保存
- デモ認証（電話番号 + コード `1234`）
- PWA（ホーム画面に追加可能）
- レスポンシブデザイン

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env.local
# .env.local に GEMINI_API_KEY を設定

# 開発サーバー起動
pnpm dev
```

## Vercelへのデプロイ

1. [Vercel](https://vercel.com) にログイン
2. GitHubリポジトリをインポート
3. `vercel-lite` ブランチを選択
4. 環境変数 `GEMINI_API_KEY` を設定
5. デプロイ

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `GEMINI_API_KEY` | Google Gemini API キー | ✅ |

## デモ認証

- 任意の電話番号を入力
- 認証コード: `1234`

## ライセンス

Private - All rights reserved.
