import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json(
      { error: "STRIPE_WEBHOOK_SECRET is not set" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: "TRIALING",
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: "TRIALING",
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const statusMap: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "INACTIVE"> = {
          active: "ACTIVE",
          past_due: "PAST_DUE",
          canceled: "CANCELED",
          trialing: "TRIALING",
          unpaid: "INACTIVE",
          incomplete: "INACTIVE",
          incomplete_expired: "INACTIVE",
          paused: "INACTIVE",
        };

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            status: statusMap[sub.status] ?? "INACTIVE",
            stripePriceId: sub.items.data[0]?.price?.id ?? null,
            currentPeriodStart: new Date((sub as unknown as { current_period_start: number }).current_period_start * 1000),
            currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
          create: {
            userId,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            status: statusMap[sub.status] ?? "INACTIVE",
            stripePriceId: sub.items.data[0]?.price?.id ?? null,
            currentPeriodStart: new Date((sub as unknown as { current_period_start: number }).current_period_start * 1000),
            currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await prisma.subscription.update({
          where: { userId },
          data: { status: "CANCELED" },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.parent?.subscription_details?.subscription;
        const sub = subId
          ? await stripe.subscriptions.retrieve(typeof subId === "string" ? subId : subId.id)
          : null;
        const userId = sub?.metadata?.userId;
        if (!userId) break;

        await prisma.payment.create({
          data: {
            userId,
            stripePaymentId: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "SUCCEEDED",
            description: `月額プラン - ${new Date(invoice.period_start * 1000).toLocaleDateString("ja-JP")}`,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.parent?.subscription_details?.subscription;
        const sub = subId
          ? await stripe.subscriptions.retrieve(typeof subId === "string" ? subId : subId.id)
          : null;
        const userId = sub?.metadata?.userId;
        if (!userId) break;

        await prisma.payment.create({
          data: {
            userId,
            stripePaymentId: invoice.id,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: "FAILED",
            description: "決済失敗",
          },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return Response.json({ received: true });
}
