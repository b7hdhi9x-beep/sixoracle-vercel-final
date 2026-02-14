import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return Response.json(
        { error: "サブスクリプションが見つかりません" },
        { status: 404 }
      );
    }

    const stripe = getStripe();
    const { origin } = new URL(request.url);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return Response.json(
      { error: "カスタマーポータルの作成に失敗しました" },
      { status: 500 }
    );
  }
}
