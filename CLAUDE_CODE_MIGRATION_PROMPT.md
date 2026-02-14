# 六神ノ間（Six Oracle） — Migration Prompt

## プロジェクト概要
「六神ノ間（Six Oracle）」は、11人のAI占い師によるチャット占いSaaSアプリケーション。
ユーザーは月額1,980円のサブスクリプションで、11人の個性豊かなAI占い師と対話し、
四柱推命・易経・タロット・西洋占星術など多彩な占術による鑑定を受けることができる。

## 技術スタック
- **フレームワーク**: Next.js 15 (App Router, TypeScript, src/ ディレクトリ)
- **スタイリング**: Tailwind CSS v4 + shadcn/ui
- **DB/ORM**: Prisma + Supabase (PostgreSQL)
- **認証**: NextAuth.js v5 (beta)
- **決済**: Stripe (月額1,980円固定)
- **AI**: Google Generative AI (Gemini API) — サーバーサイドのみ
- **アニメーション**: Framer Motion
- **画像最適化**: Sharp
- **PWA**: next-pwa
- **フォント**: Cinzel (見出し) + Noto Serif JP (和文セリフ) + Noto Sans JP (和文ゴシック)

## デザインテーマ
- **カラーパレット**:
  - 背景: ダークミスティカル（深い紺色 #0a0a1a → #1a0a2e グラデーション）
  - プライマリ: 金色 (#d4af37, #f4d03f)
  - セカンダリ: 紫色 (#7c3aed, #a855f7)
  - アクセント: 深紅 (#dc2626)
  - テキスト: 白 (#ffffff), ゴールド (#d4af37), グレー (#9ca3af)
  - カード背景: rgba(255, 255, 255, 0.05) with backdrop-blur
- **フォント**:
  - 見出し・ロゴ: Cinzel (装飾的セリフ)
  - 和文見出し: Noto Serif JP
  - 本文: Noto Sans JP
- **雰囲気**: 神秘的・荘厳・高級感。星空・光のパーティクル・グロウエフェクト

## 環境変数
```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# Google AI (サーバーサイドのみ)
GOOGLE_AI_API_KEY=""

# Stripe
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_ID=""
```

## 料金体系
- 月額: 1,980円（税込）
- 無料トライアル: 初回3日間
- 全占い師との無制限チャット

---

## Phase 1: 基盤構築（現在）

### 1. Prismaスキーマ
主要テーブル:
- **User**: ユーザー情報（NextAuth連携）
- **Account / Session / VerificationToken**: NextAuth必須テーブル
- **Subscription**: Stripeサブスク情報
- **Payment**: 決済履歴
- **ChatSession**: チャットセッション（ユーザー × 占い師）
- **ChatMessage**: チャットメッセージ（role: user/assistant/system）
- **Notification**: ユーザー通知

### 2. 11人の占い師データ (lib/oracles.ts)
六壬神課の十二天将をベースにした11人のAI占い師:

| # | ID | 名前 | 称号 | 専門占術 |
|---|-----|------|------|---------|
| 1 | seiryu | 青龍 (せいりゅう) | 東方守護の導き手 | 四柱推命 |
| 2 | suzaku | 朱雀 (すざく) | 南方炎舞の予言者 | 風水・方位学 |
| 3 | byakko | 白虎 (びゃっこ) | 西方裁断の審判者 | 霊感タロット |
| 4 | genbu | 玄武 (げんぶ) | 北方深淵の賢者 | 易経・周易 |
| 5 | kouchin | 勾陳 (こうちん) | 中央鎮守の守護者 | 九星気学 |
| 6 | touda | 螣蛇 (とうだ) | 時空超越の蛇巫 | 夢占い・霊視 |
| 7 | tenkou | 天后 (てんこう) | 月光慈愛の巫女 | 宿曜占術 |
| 8 | taiin | 太陰 (たいいん) | 星影流転の占星師 | 西洋占星術 |
| 9 | rikugou | 六合 (りくごう) | 万縁結びの仲人 | 数秘術・相性占い |
| 10 | taijou | 太常 (たいじょう) | 言霊解析の学者 | 姓名判断 |
| 11 | tenkuu | 天空 (てんくう) | 天界総覧の大神官 | 総合鑑定 |

各占い師は独自の口調・性格・鑑定スタイルを持つ。

### 3. 占術計算エンジン (server/fortuneCalculations.ts)
- **六獣計算**: 日干から六獣（青龍・朱雀・勾陳・螣蛇・白虎・玄武）を算出
- **干支計算**: 生年月日から年柱・月柱・日柱の天干地支を算出
- **五行計算**: 天干地支から五行（木・火・土・金・水）のバランスを算出
- **相性計算**: 二人の命式から五行相生相剋による相性を判定

### 4. チャットAPI (app/api/chat/route.ts)
- Gemini API (gemini-2.0-flash) をサーバーサイドで使用
- 占い師ごとのシステムプロンプトで個性を制御
- ストリーミングレスポンス対応
- チャット履歴のDB保存

### 5. ホームページ
- ダークミスティカルテーマ
- ヒーローセクション（タイトル + キャッチコピー + CTA）
- 占い師一覧セクション（11人のカード）
- 料金セクション（月額1,980円）
- フッター

### 6. ダッシュボード
- 占い師選択グリッド
- チャット画面（リアルタイムストリーミング）
- セッション履歴

---

## Phase 2: 認証・決済（予定）
- NextAuth.js v5 によるGoogle/Email認証
- Stripe Checkout による月額課金
- Webhook処理
- サブスクリプション管理画面

## Phase 3: 高度な機能（予定）
- PWA対応
- プッシュ通知
- 占い結果の保存・共有
- 占い師お気に入り機能
- 鑑定履歴のエクスポート

## Phase 4: 最適化・本番準備（予定）
- パフォーマンス最適化
- SEO対策
- アクセシビリティ改善
- エラーハンドリング強化
- モニタリング・ログ設定
