-- =============================================
-- Additional columns for profiles (if upgrading)
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_messages_today INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_reset_date DATE;

-- =============================================
-- Chat logs table (simple flat log for API-level tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  oracle_id TEXT NOT NULL,
  session_id UUID,
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON public.chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_oracle_id ON public.chat_logs(oracle_id);

ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chat logs" ON public.chat_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert chat logs" ON public.chat_logs
  FOR INSERT WITH CHECK (true);
