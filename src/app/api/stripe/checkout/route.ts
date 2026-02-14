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

    const stripe = getStripe();

    // 既存のStripe顧客を検索またはDB内情報を利用
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return Response.json(
        { error: "STRIPE_PRICE_ID が設定されていません" },
        { status: 500 }
      );
    }

    const { origin } = new URL(request.url);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=cancel`,
      subscription_data: {
        trial_period_days: 3,
        metadata: { userId: user.id },
      },
      metadata: { userId: user.id },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json(
      { error: "Checkout セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
