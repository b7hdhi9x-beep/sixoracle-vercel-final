import { getSupabaseAdmin, getSupabaseClient } from "./supabase";
import { NextResponse } from "next/server";

/**
 * サーバーサイドで認証済みユーザーを取得するヘルパー
 * API Route で使用
 */
export async function getAuthenticatedUser(request: Request) {
  const supabase = getSupabaseClient();
  
  // Authorization ヘッダーからトークンを取得
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (user && !error) return user;
  }
  
  // Cookie からセッションを取得（ブラウザからのリクエスト）
  const cookieHeader = request.headers.get("cookie") || "";
  // Supabase のセッションクッキーを解析
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user;
  
  return null;
}

/**
 * サーバーサイドで認証済みユーザーを取得（Supabase Admin経由）
 * Authorization ヘッダーのJWTトークンを検証
 */
export async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  
  const token = authHeader.slice(7);
  const supabaseAdmin = getSupabaseAdmin();
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
}

/**
 * ユーザーのプロフィールを取得（profiles テーブルから）
 */
export async function getUserProfile(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) return null;
  return data;
}

/**
 * ユーザーが管理者かチェック
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.role === "admin";
}

/**
 * 認証必須のAPIレスポンスヘルパー
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "権限がありません" }, { status: 403 });
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: any) {
  return NextResponse.json(data);
}

/**
 * 日付ヘルパー（JST）
 */
export function getJSTDate(): Date {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst;
}

export function getJSTDateString(): string {
  const jst = getJSTDate();
  return jst.toISOString().split("T")[0];
}

/**
 * 使用量チェック
 */
export async function checkDailyUsage(userId: string): Promise<{
  canUse: boolean;
  remaining: number;
  limit: number;
  isPremium: boolean;
}> {
  const supabaseAdmin = getSupabaseAdmin();
  const today = getJSTDateString();
  
  // プロフィールからプレミアム状態を確認
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_premium, daily_messages_today, daily_reset_date")
    .eq("id", userId)
    .single();
  
  if (!profile) {
    return { canUse: false, remaining: 0, limit: 0, isPremium: false };
  }
  
  const isPremium = profile.is_premium || false;
  const limit = isPremium ? 100 : 5;
  
  // 日付が変わっていたらリセット
  if (profile.daily_reset_date !== today) {
    await supabaseAdmin
      .from("profiles")
      .update({ daily_messages_today: 0, daily_reset_date: today })
      .eq("id", userId);
    return { canUse: true, remaining: limit, limit, isPremium };
  }
  
  const used = profile.daily_messages_today || 0;
  const remaining = Math.max(0, limit - used);
  
  return { canUse: remaining > 0, remaining, limit, isPremium };
}

/**
 * 使用量をインクリメント
 */
export async function incrementDailyUsage(userId: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const today = getJSTDateString();
  
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("daily_messages_today, daily_reset_date")
    .eq("id", userId)
    .single();
  
  if (!profile) return;
  
  const currentCount = profile.daily_reset_date === today 
    ? (profile.daily_messages_today || 0) 
    : 0;
  
  await supabaseAdmin
    .from("profiles")
    .update({ 
      daily_messages_today: currentCount + 1,
      daily_reset_date: today 
    })
    .eq("id", userId);
}
