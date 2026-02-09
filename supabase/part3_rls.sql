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

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON public.daily_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.daily_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.daily_usage FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own referral code" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view referral codes" ON public.referral_codes FOR SELECT USING (true);

CREATE POLICY "Users can manage own favorites" ON public.favorite_oracles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own fav messages" ON public.favorite_messages FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own intimacy" ON public.user_oracle_intimacy FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own intimacy" ON public.user_oracle_intimacy FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scheduled msgs" ON public.scheduled_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own scheduled msgs" ON public.scheduled_messages FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own msg prefs" ON public.user_message_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own companion" ON public.user_companion_settings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own anniversaries" ON public.user_anniversaries FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own logins" ON public.daily_logins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logins" ON public.daily_logins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own mbti" ON public.mbti_history FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own shares" ON public.share_bonus FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own trial" ON public.trial_usage FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own purchases" ON public.purchase_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bank" ON public.user_bank_accounts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rewards" ON public.user_reward_balances FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own withdrawals" ON public.withdrawal_requests FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own email prefs" ON public.email_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own login history" ON public.login_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view public feedback" ON public.feedback FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Anyone can create feedback box" ON public.feedback_box FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view approved feedback" ON public.feedback_box FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contact inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own contact inquiries" ON public.contact_inquiries FOR SELECT USING (auth.uid() = user_id);


