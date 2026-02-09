-- ============================================================
-- 六神ノ間 (Six Oracle) - Complete Supabase Database Schema
-- Migrated from Manus/Drizzle (MySQL) to PostgreSQL/Supabase
-- Total: 62 tables (all features from Manus version)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (Core user table, extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nickname TEXT,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  display_name VARCHAR(100),
  zodiac_sign VARCHAR(20),
  birthdate DATE,
  blood_type TEXT,
  bio TEXT,
  memo TEXT,
  -- Role & Plan
  role VARCHAR(10) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  plan_type VARCHAR(20) DEFAULT 'trial' NOT NULL CHECK (plan_type IN ('free', 'trial', 'standard', 'premium_unlimited', 'premium')),
  -- Usage limits
  daily_reading_limit INT DEFAULT 10 NOT NULL,
  daily_readings_used INT DEFAULT 0 NOT NULL,
  last_daily_reset DATE,
  daily_messages_today INT DEFAULT 0 NOT NULL,
  daily_reset_date DATE,
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status VARCHAR(20) DEFAULT 'none' NOT NULL CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'none')),
  premium_expires_at TIMESTAMPTZ,
  premium_granted_by TEXT,
  renewal_reminder_sent BOOLEAN DEFAULT FALSE NOT NULL,
  -- Trial tracking
  trial_exchanges_used INT DEFAULT 0 NOT NULL,
  total_free_readings INT DEFAULT 0 NOT NULL,
  used_free_readings INT DEFAULT 0 NOT NULL,
  free_messages_remaining INT DEFAULT 5 NOT NULL,
  bonus_readings INT DEFAULT 0 NOT NULL,
  purchased_readings INT DEFAULT 0 NOT NULL,
  -- Oracle selection
  selected_oracle_id VARCHAR(50),
  purchased_oracle_ids TEXT,
  has_used_first_recovery_discount BOOLEAN DEFAULT FALSE NOT NULL,
  -- Subscription tracking
  subscription_start_date TIMESTAMPTZ,
  continuous_months INT DEFAULT 0 NOT NULL,
  unlocked_benefits TEXT,
  -- Tester flag
  is_tester BOOLEAN DEFAULT FALSE NOT NULL,
  -- Session management
  current_session_token VARCHAR(64),
  last_login_at TIMESTAMPTZ,
  last_login_device TEXT,
  -- Auto-archive
  auto_archive_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  auto_archive_days INT DEFAULT 30 NOT NULL,
  -- Block/suspension
  is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
  block_reason VARCHAR(30) CHECK (block_reason IN ('bot_detected', 'rate_limit_abuse', 'manual_block', 'terms_violation', 'other')),
  blocked_at TIMESTAMPTZ,
  blocked_by UUID,
  block_note TEXT,
  -- Referral
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  -- Misc
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  total_messages_sent INT DEFAULT 0 NOT NULL,
  language TEXT DEFAULT 'ja',
  login_method VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_signed_in TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 2. CHAT SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  oracle_id VARCHAR(50) NOT NULL,
  title TEXT DEFAULT '',
  summary TEXT,
  character_quote VARCHAR(200),
  category VARCHAR(20) CHECK (category IN ('love', 'work', 'health', 'money', 'relationships', 'future', 'spiritual', 'other')),
  is_complete BOOLEAN DEFAULT FALSE NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  deleted_at TIMESTAMPTZ,
  deleted_reason VARCHAR(500),
  restored_at TIMESTAMPTZ,
  restored_by_admin_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 3. CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  oracle_id VARCHAR(50) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 4. CHAT LOGS (legacy)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  oracle_id VARCHAR(50) NOT NULL,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 5. DAILY USAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INT DEFAULT 0 NOT NULL,
  count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

-- ============================================================
-- 6. CANCELLATION FEEDBACK
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cancellation_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason VARCHAR(30) NOT NULL CHECK (reason IN ('price', 'not_useful', 'not_accurate', 'found_alternative', 'temporary', 'other')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('new_oracle', 'weekly_fortune', 'payment', 'system', 'campaign', 'referral', 'withdrawal', 'consultation_followup', 'monthly_fortune', 'daily_fortune', 'oracle_message')),
  metadata TEXT,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 8. PUSH SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 9. EMAIL PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  weekly_fortune BOOLEAN DEFAULT TRUE NOT NULL,
  daily_fortune BOOLEAN DEFAULT FALSE NOT NULL,
  monthly_fortune BOOLEAN DEFAULT TRUE NOT NULL,
  consultation_followup BOOLEAN DEFAULT TRUE NOT NULL,
  new_oracle BOOLEAN DEFAULT TRUE NOT NULL,
  campaign BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 10. CONTACT INQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('general', 'payment', 'subscription', 'technical', 'feedback', 'other')),
  message TEXT NOT NULL,
  message_translated TEXT,
  language VARCHAR(10) DEFAULT 'ja' NOT NULL,
  status VARCHAR(20) DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 11. CONTACT REPLIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES public.contact_inquiries(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_translated TEXT,
  language VARCHAR(10) DEFAULT 'ja' NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 12. FEEDBACK BOX
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feedback_box (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name VARCHAR(200) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('praise', 'suggestion', 'bug_report', 'feature_request', 'other')),
  message TEXT NOT NULL,
  message_translated TEXT,
  language VARCHAR(10) DEFAULT 'ja' NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  is_public BOOLEAN DEFAULT TRUE NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE NOT NULL,
  admin_note TEXT,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_info TEXT,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  screenshot_url TEXT,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_from_tester BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 13. FEEDBACK BLOCK LIST
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feedback_block_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_type VARCHAR(10) NOT NULL CHECK (block_type IN ('ip', 'user')),
  block_value VARCHAR(255) NOT NULL,
  reason TEXT,
  blocked_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ
);

-- ============================================================
-- 14. FEEDBACK REPLIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feedback_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL REFERENCES public.feedback_box(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  admin_name VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  message_translated TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 15. REFERRAL CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  used_count INT DEFAULT 0 NOT NULL,
  monthly_used_count INT DEFAULT 0 NOT NULL,
  last_monthly_reset DATE,
  bonus_readings INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 16. REFERRAL USAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referral_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  bonus_given BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 17. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('premium_monthly', 'premium_lifetime', 'bonus_readings')),
  value INT DEFAULT 0 NOT NULL,
  duration_days INT,
  max_uses INT,
  used_count INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 18. COUPON USAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  premium_expires_at TIMESTAMPTZ
);

-- ============================================================
-- 19. EMAIL CREDENTIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  verification_token VARCHAR(100),
  verification_expires TIMESTAMPTZ,
  reset_token VARCHAR(100),
  reset_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 20. PURCHASE HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchase_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('reading_recovery', 'additional_oracle', 'premium_subscription', 'premium_upgrade', 'daily_recovery')),
  oracle_id VARCHAR(50),
  amount INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 21. TRIAL USAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trial_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  oracle_id VARCHAR(50) NOT NULL,
  exchange_count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, oracle_id)
);

-- ============================================================
-- 22. ORACLE REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.oracle_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_oracle_id VARCHAR(50) NOT NULL,
  to_oracle_id VARCHAR(50) NOT NULL,
  session_id UUID,
  referral_context TEXT,
  was_followed BOOLEAN DEFAULT FALSE NOT NULL,
  followed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 23. USER CONSULTATION TOPICS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_consultation_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic VARCHAR(20) NOT NULL CHECK (topic IN ('love', 'marriage', 'work', 'career', 'money', 'health', 'family', 'relationships', 'future', 'decision', 'spiritual', 'other')),
  frequency INT DEFAULT 1 NOT NULL,
  last_consulted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 24. ACTIVATION CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  status VARCHAR(10) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'used', 'expired')),
  plan_type VARCHAR(10) DEFAULT 'monthly' NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  used_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  duration_days INT DEFAULT 30 NOT NULL,
  created_by_admin_id UUID NOT NULL,
  customer_email VARCHAR(320),
  customer_name VARCHAR(200),
  transfer_reference VARCHAR(200),
  admin_note TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 25. BANK TRANSFER REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bank_transfer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email VARCHAR(320) NOT NULL,
  name VARCHAR(200) NOT NULL,
  plan_type VARCHAR(10) DEFAULT 'monthly' NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  amount INT DEFAULT 1980 NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rejected')),
  activation_code_id UUID REFERENCES public.activation_codes(id) ON DELETE SET NULL,
  confirmed_by_admin_id UUID,
  confirmed_at TIMESTAMPTZ,
  admin_note TEXT,
  user_note TEXT,
  transfer_reported BOOLEAN DEFAULT FALSE NOT NULL,
  transfer_reported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 26. PHONE CREDENTIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.phone_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  otp_code VARCHAR(6),
  otp_expires TIMESTAMPTZ,
  otp_attempts INT DEFAULT 0 NOT NULL,
  last_otp_sent_at TIMESTAMPTZ,
  daily_resend_count INT DEFAULT 0 NOT NULL,
  last_resend_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 27. LOGIN HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  login_method VARCHAR(10) NOT NULL CHECK (login_method IN ('email', 'phone', 'oauth')),
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  success BOOLEAN DEFAULT TRUE NOT NULL,
  failure_reason VARCHAR(200),
  session_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 28. REFERRAL REWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  amount INT DEFAULT 500 NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting_90days' NOT NULL CHECK (status IN ('waiting_30days', 'waiting_90days', 'pending', 'approved', 'paid', 'cancelled')),
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  retention_ends_at TIMESTAMPTZ,
  retention_passed BOOLEAN DEFAULT FALSE NOT NULL,
  approved_at TIMESTAMPTZ,
  approved_by_admin_id UUID,
  paid_at TIMESTAMPTZ,
  paid_by_admin_id UUID,
  payout_request_id UUID,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 29. PAYOUT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  transfer_fee INT DEFAULT 300 NOT NULL,
  actual_transfer_amount INT NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  branch_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(10) DEFAULT 'ordinary' NOT NULL CHECK (account_type IN ('ordinary', 'checking', 'savings')),
  account_number VARCHAR(20) NOT NULL,
  account_holder_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  processed_at TIMESTAMPTZ,
  processed_by_admin_id UUID,
  transfer_reference VARCHAR(100),
  rejection_reason TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 30. USER BANK ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bank_name VARCHAR(100) NOT NULL,
  bank_code VARCHAR(10),
  branch_name VARCHAR(100) NOT NULL,
  branch_code VARCHAR(10),
  account_type VARCHAR(10) DEFAULT 'ordinary' NOT NULL CHECK (account_type IN ('ordinary', 'checking', 'savings')),
  account_number VARCHAR(20) NOT NULL,
  account_holder_name VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT TRUE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 31. CONTINUATION BONUSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.continuation_bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_type VARCHAR(10) NOT NULL CHECK (milestone_type IN ('3_months', '6_months', '12_months')),
  amount INT NOT NULL,
  status VARCHAR(10) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'paid')),
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 32. SUBSCRIPTION HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  consecutive_months INT DEFAULT 0 NOT NULL,
  last_bonus_milestone VARCHAR(10) DEFAULT 'none' NOT NULL CHECK (last_bonus_milestone IN ('none', '3_months', '6_months', '12_months')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 33. SUBSCRIPTIONS (Stripe tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'inactive' NOT NULL,
  plan_id TEXT DEFAULT 'pro_monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 34. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount INT NOT NULL,
  currency TEXT DEFAULT 'jpy',
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 35. WITHDRAWAL REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  bank_name VARCHAR(100) NOT NULL,
  bank_code VARCHAR(10) NOT NULL,
  branch_name VARCHAR(100) NOT NULL,
  branch_code VARCHAR(10) NOT NULL,
  account_type VARCHAR(10) DEFAULT 'ordinary' NOT NULL CHECK (account_type IN ('ordinary', 'checking', 'savings')),
  account_number VARCHAR(20) NOT NULL,
  account_holder VARCHAR(100) NOT NULL,
  admin_note TEXT,
  rejection_reason TEXT,
  scheduled_transfer_date DATE,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  processed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 36. USER REWARD BALANCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_reward_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_earned INT DEFAULT 0 NOT NULL,
  total_withdrawn INT DEFAULT 0 NOT NULL,
  pending_withdrawal INT DEFAULT 0 NOT NULL,
  available_balance INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 37. MONTHLY ACTIVATION CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.monthly_activation_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  valid_month VARCHAR(7) NOT NULL,
  plan_type VARCHAR(10) DEFAULT 'monthly' NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  duration_days INT DEFAULT 30 NOT NULL,
  max_uses INT,
  current_uses INT DEFAULT 0 NOT NULL,
  status VARCHAR(10) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'expired')),
  created_by_admin_id UUID,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 38. MONTHLY CODE USAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.monthly_code_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code_id UUID NOT NULL REFERENCES public.monthly_activation_codes(id) ON DELETE CASCADE,
  used_month VARCHAR(7) NOT NULL,
  premium_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 39. PREMIUM GRANT HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.premium_grant_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by_admin_id UUID,
  grant_type VARCHAR(20) NOT NULL CHECK (grant_type IN ('manual', 'code', 'subscription', 'referral')),
  duration_days INT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  note TEXT,
  related_code VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 40. PREMIUM UPGRADE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.premium_upgrade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(10) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  admin_note TEXT,
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  processed_by UUID,
  duration_days INT DEFAULT 30 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 41. SUSPICIOUS ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suspicious_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(30) NOT NULL CHECK (activity_type IN ('bot_detected', 'rate_limit_abuse', 'repetitive_messages', 'automated_pattern', 'high_frequency', 'admin_session_delete')),
  suspicion_score INT NOT NULL,
  trigger_message TEXT,
  details TEXT,
  resulted_in_block BOOLEAN DEFAULT FALSE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 42. FAVORITE ORACLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorite_oracles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  oracle_id VARCHAR(50) NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, oracle_id)
);

-- ============================================================
-- 43. SCHEDULED MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scheduled_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  oracle_id VARCHAR(50) NOT NULL,
  message_type VARCHAR(30) NOT NULL CHECK (message_type IN ('weekly_fortune', 'seasonal', 'special', 'daily_fortune', 'calendar_event', 'anniversary_today', 'anniversary_reminder', 'daily_greeting')),
  title VARCHAR(200),
  content TEXT NOT NULL,
  status VARCHAR(10) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 44. USER MESSAGE PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_message_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  weekly_fortune_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  weekly_fortune_oracle_id VARCHAR(50),
  seasonal_messages_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  daily_fortune_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  daily_fortune_oracle_id VARCHAR(50),
  preferred_delivery_hour INT DEFAULT 8 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 45. USER COMPANION SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_companion_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  watch_mode_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  default_conversation_mode VARCHAR(20) DEFAULT 'consultation' NOT NULL CHECK (default_conversation_mode IN ('consultation', 'daily_sharing')),
  calendar_notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  anniversary_notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  preferred_oracle_for_notifications VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 46. USER ANNIVERSARIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_anniversaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  day INT NOT NULL CHECK (day >= 1 AND day <= 31),
  year INT,
  category VARCHAR(20) DEFAULT 'personal' NOT NULL CHECK (category IN ('love', 'work', 'family', 'health', 'personal', 'other')),
  notification_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  reminder_days_before INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 47. CALENDAR EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('seasonal', 'lunar', 'solar', 'traditional', 'special')),
  month INT NOT NULL,
  day INT NOT NULL,
  year INT,
  is_recurring BOOLEAN DEFAULT TRUE NOT NULL,
  significance TEXT,
  message_template TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 48. USER-ORACLE INTIMACY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_oracle_intimacy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  oracle_id VARCHAR(50) NOT NULL,
  level INT DEFAULT 1 NOT NULL,
  experience_points INT DEFAULT 0 NOT NULL,
  points_to_next_level INT DEFAULT 100 NOT NULL,
  total_conversations INT DEFAULT 0 NOT NULL,
  total_messages INT DEFAULT 0 NOT NULL,
  current_streak INT DEFAULT 0 NOT NULL,
  longest_streak INT DEFAULT 0 NOT NULL,
  last_interaction_date DATE,
  unlocked_features TEXT,
  first_interaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, oracle_id)
);

-- ============================================================
-- 49. INTIMACY REWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.intimacy_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  required_level INT NOT NULL,
  reward_type VARCHAR(30) NOT NULL CHECK (reward_type IN ('title', 'image_style', 'special_greeting', 'exclusive_advice', 'anniversary_message', 'custom_avatar', 'exclusive_menu', 'deep_reading', 'special_prompt')),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  reward_data TEXT,
  oracle_id VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 50. DAILY LOGINS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_logins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  login_date DATE NOT NULL,
  bonus_points_earned INT DEFAULT 10 NOT NULL,
  streak_multiplier INT DEFAULT 100 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, login_date)
);

-- ============================================================
-- 51. FAVORITE MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorite_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  oracle_id VARCHAR(50) NOT NULL,
  cached_content TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, message_id)
);

-- ============================================================
-- 52. SHARE BONUS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.share_bonus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitter', 'instagram', 'line', 'facebook', 'other')),
  session_id UUID,
  bonus_readings_awarded INT DEFAULT 1 NOT NULL,
  share_identifier VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 53. LIMITED CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.limited_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('first_n_discount', 'time_limited', 'seasonal')),
  discount_percent INT DEFAULT 0 NOT NULL,
  max_users INT NOT NULL,
  claimed_count INT DEFAULT 0 NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 54. CAMPAIGN CLAIMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaign_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.limited_campaigns(id) ON DELETE CASCADE,
  discount_applied INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 55. ANONYMOUS QUOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.anonymous_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  oracle_id VARCHAR(50) NOT NULL,
  quote_content TEXT NOT NULL,
  category VARCHAR(20) CHECK (category IN ('love', 'work', 'health', 'money', 'relationships', 'future', 'spiritual', 'other')),
  user_consented BOOLEAN DEFAULT FALSE NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE NOT NULL,
  view_count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 56. FREE TRIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.free_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_fingerprint VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  trial_used BOOLEAN DEFAULT FALSE NOT NULL,
  oracle_id VARCHAR(50),
  used_at TIMESTAMPTZ,
  converted_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 57. MBTI HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mbti_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mbti_type VARCHAR(4) NOT NULL,
  e_score INT DEFAULT 0 NOT NULL,
  s_score INT DEFAULT 0 NOT NULL,
  t_score INT DEFAULT 0 NOT NULL,
  j_score INT DEFAULT 0 NOT NULL,
  test_source VARCHAR(20) DEFAULT 'quick_test' NOT NULL CHECK (test_source IN ('quick_test', 'full_test', 'chat')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 58. MBTI GROUP RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mbti_group_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id VARCHAR(32) NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  group_name VARCHAR(100),
  members_data TEXT NOT NULL,
  group_score INT NOT NULL,
  analysis_data TEXT NOT NULL,
  matrix_data TEXT NOT NULL,
  view_count INT DEFAULT 0 NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 59. ACCOUNT MERGE HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.account_merge_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_account_id UUID NOT NULL,
  merged_account_id UUID NOT NULL,
  merged_by_admin_id UUID NOT NULL,
  merge_reason TEXT NOT NULL,
  merged_account_snapshot TEXT NOT NULL,
  transferred_data TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 60. USER AUTH METHODS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_auth_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  auth_type VARCHAR(10) NOT NULL CHECK (auth_type IN ('email', 'phone', 'oauth')),
  identifier VARCHAR(320) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  verification_code VARCHAR(10),
  verification_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 61. SUSPICIOUS ACCOUNT PATTERNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suspicious_account_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_ids TEXT NOT NULL,
  detection_type VARCHAR(30) NOT NULL CHECK (detection_type IN ('same_device', 'same_ip', 'similar_name', 'same_email_pattern', 'manual_flag')),
  detection_details TEXT NOT NULL,
  confidence_score INT NOT NULL,
  status VARCHAR(20) DEFAULT 'detected' NOT NULL CHECK (status IN ('detected', 'investigating', 'confirmed', 'dismissed')),
  reviewed_by_admin_id UUID,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 62. PAYMENT LINKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id VARCHAR(64) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('telecom_credit', 'alpha_note', 'bank_transfer', 'other')),
  plan_type VARCHAR(10) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  amount INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
  payment_url TEXT,
  metadata TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  external_payment_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 63. PAYMENT WEBHOOKS (audit log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('telecom_credit', 'alpha_note', 'bank_transfer', 'other')),
  payload TEXT NOT NULL,
  event_type VARCHAR(100),
  payment_link_id UUID REFERENCES public.payment_links(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'received' NOT NULL CHECK (status IN ('received', 'processed', 'failed', 'ignored')),
  error_message TEXT,
  source_ip VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 64. ADMIN SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 65. FEEDBACK (simple, kept for backward compat)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'general',
  rating INT CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 66. INQUIRIES (simple, kept for backward compat)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT,
  name TEXT,
  category TEXT DEFAULT 'general',
  subject TEXT,
  message TEXT NOT NULL,
  translated_message TEXT,
  status TEXT DEFAULT 'new',
  language TEXT DEFAULT 'ja',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_type ON public.profiles(plan_type);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_oracle_id ON public.chat_sessions(oracle_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON public.chat_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON public.daily_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON public.activation_codes(code);

CREATE INDEX IF NOT EXISTS idx_login_history_user ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created ON public.login_history(created_at);

CREATE INDEX IF NOT EXISTS idx_user_oracle_intimacy ON public.user_oracle_intimacy(user_id, oracle_id);
CREATE INDEX IF NOT EXISTS idx_favorite_oracles_user ON public.favorite_oracles(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_user ON public.scheduled_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON public.scheduled_messages(status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_suspicious_logs_user ON public.suspicious_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_box_status ON public.feedback_box(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries(status);

CREATE INDEX IF NOT EXISTS idx_mbti_history_user ON public.mbti_history(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logins_user_date ON public.daily_logins(user_id, login_date);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_oracles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_oracle_intimacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_message_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_companion_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_anniversaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mbti_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_bonus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reward_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_box ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Chat sessions
CREATE POLICY "Users can view own sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Chat messages
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily usage
CREATE POLICY "Users can view own usage" ON public.daily_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.daily_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.daily_usage FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Referral codes
CREATE POLICY "Users can view own referral code" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view referral codes" ON public.referral_codes FOR SELECT USING (true);

-- Favorite oracles
CREATE POLICY "Users can manage own favorites" ON public.favorite_oracles FOR ALL USING (auth.uid() = user_id);

-- Favorite messages
CREATE POLICY "Users can manage own fav messages" ON public.favorite_messages FOR ALL USING (auth.uid() = user_id);

-- User-Oracle intimacy
CREATE POLICY "Users can view own intimacy" ON public.user_oracle_intimacy FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own intimacy" ON public.user_oracle_intimacy FOR UPDATE USING (auth.uid() = user_id);

-- Scheduled messages
CREATE POLICY "Users can view own scheduled msgs" ON public.scheduled_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own scheduled msgs" ON public.scheduled_messages FOR UPDATE USING (auth.uid() = user_id);

-- User message preferences
CREATE POLICY "Users can manage own msg prefs" ON public.user_message_preferences FOR ALL USING (auth.uid() = user_id);

-- User companion settings
CREATE POLICY "Users can manage own companion" ON public.user_companion_settings FOR ALL USING (auth.uid() = user_id);

-- User anniversaries
CREATE POLICY "Users can manage own anniversaries" ON public.user_anniversaries FOR ALL USING (auth.uid() = user_id);

-- Daily logins
CREATE POLICY "Users can view own logins" ON public.daily_logins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logins" ON public.daily_logins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MBTI history
CREATE POLICY "Users can manage own mbti" ON public.mbti_history FOR ALL USING (auth.uid() = user_id);

-- Share bonus
CREATE POLICY "Users can manage own shares" ON public.share_bonus FOR ALL USING (auth.uid() = user_id);

-- Trial usage
CREATE POLICY "Users can manage own trial" ON public.trial_usage FOR ALL USING (auth.uid() = user_id);

-- Purchase history
CREATE POLICY "Users can view own purchases" ON public.purchase_history FOR SELECT USING (auth.uid() = user_id);

-- User bank accounts
CREATE POLICY "Users can manage own bank" ON public.user_bank_accounts FOR ALL USING (auth.uid() = user_id);

-- User reward balances
CREATE POLICY "Users can view own rewards" ON public.user_reward_balances FOR SELECT USING (auth.uid() = user_id);

-- Withdrawal requests
CREATE POLICY "Users can manage own withdrawals" ON public.withdrawal_requests FOR ALL USING (auth.uid() = user_id);

-- Email preferences
CREATE POLICY "Users can manage own email prefs" ON public.email_preferences FOR ALL USING (auth.uid() = user_id);

-- Login history
CREATE POLICY "Users can view own login history" ON public.login_history FOR SELECT USING (auth.uid() = user_id);

-- Feedback box (public read, authenticated write)
CREATE POLICY "Anyone can create feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view public feedback" ON public.feedback FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Anyone can create feedback box" ON public.feedback_box FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view approved feedback" ON public.feedback_box FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

-- Contact inquiries
CREATE POLICY "Users can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contact inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own contact inquiries" ON public.contact_inquiries FOR SELECT USING (auth.uid() = user_id);


-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    LOWER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_contact_inquiries_updated_at ON public.contact_inquiries;
CREATE TRIGGER update_contact_inquiries_updated_at BEFORE UPDATE ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_feedback_box_updated_at ON public.feedback_box;
CREATE TRIGGER update_feedback_box_updated_at BEFORE UPDATE ON public.feedback_box FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_email_preferences_updated_at ON public.email_preferences;
CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON public.email_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_referral_codes_updated_at ON public.referral_codes;
CREATE TRIGGER update_referral_codes_updated_at BEFORE UPDATE ON public.referral_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_user_oracle_intimacy_updated_at ON public.user_oracle_intimacy;
CREATE TRIGGER update_user_oracle_intimacy_updated_at BEFORE UPDATE ON public.user_oracle_intimacy FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_user_message_preferences_updated_at ON public.user_message_preferences;
CREATE TRIGGER update_user_message_preferences_updated_at BEFORE UPDATE ON public.user_message_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_user_companion_settings_updated_at ON public.user_companion_settings;
CREATE TRIGGER update_user_companion_settings_updated_at BEFORE UPDATE ON public.user_companion_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
