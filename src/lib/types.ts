// ============================================
// 六神ノ間 - 共通型定義
// ============================================

// ユーザープロフィール
export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  birth_date: string | null;
  zodiac_sign: string | null;
  blood_type: string | null;
  gender: string | null;
  bio: string | null;
  role: "user" | "admin";
  is_premium: boolean;
  premium_until: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  daily_messages_today: number;
  daily_reset_date: string | null;
  selected_oracle_id: string | null;
  referral_code: string | null;
  referred_by: string | null;
  loyalty_points: number;
  total_readings: number;
  created_at: string;
  updated_at: string;
}

// チャットセッション
export interface ChatSession {
  id: string;
  user_id: string;
  oracle_id: string;
  title: string | null;
  is_pinned: boolean;
  is_archived: boolean;
  category: string | null;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

// チャットメッセージ
export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  oracle_id: string;
  role: "user" | "assistant";
  content: string;
  conversation_mode: "consultation" | "daily_sharing";
  tokens_used: number | null;
  created_at: string;
}

// 占い師
export interface Oracle {
  id: string;
  name: string;
  englishName: string;
  role: string;
  specialty: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  personality: string;
  greeting: string;
  isFree: boolean;
  isPremium: boolean;
}

// サブスクリプション
export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  plan_type: "free" | "standard" | "premium";
  status: "active" | "canceled" | "past_due" | "expired" | "trialing";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// 通知
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// お問い合わせ
export interface ContactInquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
}

// フィードバック
export interface Feedback {
  id: string;
  user_id: string | null;
  oracle_id: string | null;
  rating: number;
  comment: string | null;
  is_public: boolean;
  display_name: string | null;
  created_at: string;
}

// お気に入り
export interface Favorite {
  id: string;
  user_id: string;
  oracle_id: string;
  sort_order: number;
  created_at: string;
}

// 親密度
export interface IntimacyLevel {
  id: string;
  user_id: string;
  oracle_id: string;
  level: number;
  experience: number;
  total_messages: number;
  consecutive_days: number;
  last_interaction_date: string | null;
  created_at: string;
  updated_at: string;
}

// コンパニオン設定
export interface CompanionSettings {
  id: string;
  user_id: string;
  oracle_id: string;
  nickname: string | null;
  greeting_enabled: boolean;
  daily_message_enabled: boolean;
  anniversary_reminders: boolean;
  created_at: string;
  updated_at: string;
}

// 記念日
export interface Anniversary {
  id: string;
  user_id: string;
  oracle_id: string;
  title: string;
  date: string;
  type: string;
  is_recurring: boolean;
  created_at: string;
}

// スケジュールメッセージ
export interface ScheduledMessage {
  id: string;
  user_id: string;
  oracle_id: string;
  title: string;
  content: string;
  scheduled_at: string;
  is_read: boolean;
  created_at: string;
}

// MBTI結果
export interface MBTIResult {
  id: string;
  user_id: string;
  oracle_id: string;
  mbti_type: string;
  analysis: string;
  share_id: string | null;
  created_at: string;
}

// ランキングエントリ
export interface RankingEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  oracle_id: string;
  message_count: number;
  rank: number;
}

// クーポン
export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

// 報酬
export interface Reward {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "rejected";
  description: string | null;
  created_at: string;
}

// マーケティングキャンペーン
export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: string;
  reward_type: string;
  reward_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_claims: number;
  current_claims: number;
  created_at: string;
}

// API レスポンス型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// ページネーション
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
