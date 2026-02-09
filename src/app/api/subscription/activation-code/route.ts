import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const { code } = await request.json();
  if (!code) return NextResponse.json({ success: false, message: "コードを入力してください" });
  const supabase = getSupabaseAdmin();
  const { data: codeData } = await supabase.from("activation_codes").select("*").eq("code", code.trim()).eq("is_used", false).single();
  if (!codeData) return NextResponse.json({ success: false, message: "無効なコードです" });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (codeData.duration_days || 30));
  await supabase.from("profiles").update({ is_premium: true, premium_expires_at: expiresAt.toISOString(), premium_granted_by: "activation_code" }).eq("id", user.id);
  await supabase.from("activation_codes").update({ is_used: true, used_by: user.id, used_at: new Date().toISOString() }).eq("id", codeData.id);
  return NextResponse.json({ success: true, message: "プレミアムプランが有効になりました！" });
}
