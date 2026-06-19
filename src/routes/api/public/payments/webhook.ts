import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";
import type { Database } from "@/integrations/supabase/types";

let _supabase: SupabaseClient<Database> | null = null;
function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

const SIGNUP_BONUS_COINS = 500;

function planFor(priceId: string): "monthly" | "annual" {
  return priceId.includes("annual") ? "annual" : "monthly";
}

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } = data;
  const userId = customData?.userId;
  if (!userId) {
    console.error("No userId in customData");
    return;
  }
  const item = items[0];
  const priceId = item.price.importMeta?.externalId;
  const productId = item.product.importMeta?.externalId;
  if (!priceId || !productId) {
    console.warn("Skipping subscription: missing importMeta.externalId");
    return;
  }

  const supa = getSupabase();

  // Idempotent: only award the welcome bonus if this paddle_subscription_id
  // is brand new to our database (webhooks may be retried).
  const { data: existing } = await supa
    .from("subscriptions")
    .select("id")
    .eq("paddle_subscription_id", id)
    .maybeSingle();
  const isNew = !existing;

  await supa.from("subscriptions").upsert(
    {
      user_id: userId,
      paddle_subscription_id: id,
      paddle_customer_id: customerId,
      product_id: productId,
      price_id: priceId,
      status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "paddle_subscription_id" },
  );

  await supa
    .from("profiles")
    .update({
      is_premium: ["active", "trialing", "past_due"].includes(status),
      premium_plan: planFor(priceId),
      premium_until: currentBillingPeriod?.endsAt ?? null,
    })
    .eq("id", userId);

  if (isNew) {
    const { data: profile } = await supa
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .maybeSingle();
    const current = profile?.coins ?? 0;
    await supa
      .from("profiles")
      .update({ coins: current + SIGNUP_BONUS_COINS })
      .eq("id", userId);
  }
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, items, status, currentBillingPeriod, scheduledChange, customData } = data;
  const item = items?.[0];
  const priceId = item?.price?.importMeta?.externalId;

  await getSupabase()
    .from("subscriptions")
    .update({
      status,
      ...(priceId ? { price_id: priceId } : {}),
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      cancel_at_period_end: scheduledChange?.action === "cancel",
      updated_at: new Date().toISOString(),
    })
    .eq("paddle_subscription_id", id)
    .eq("environment", env);

  const userId = customData?.userId;
  if (userId) {
    // past_due keeps premium active so users see a "fix payment" banner
    // rather than being kicked off mid-cycle.
    await getSupabase()
      .from("profiles")
      .update({
        is_premium: ["active", "trialing", "past_due"].includes(status),
        ...(priceId ? { premium_plan: planFor(priceId) } : {}),
        premium_until: currentBillingPeriod?.endsAt ?? null,
      })
      .eq("id", userId);
  }
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  const { id, customData } = data;
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("paddle_subscription_id", id)
    .eq("environment", env);

  // Immediate revocation policy: premium ends the moment they cancel.
  const userId = customData?.userId;
  if (userId) {
    await getSupabase()
      .from("profiles")
      .update({
        is_premium: false,
        premium_plan: null,
        premium_until: null,
      })
      .eq("id", userId);
  }
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.eventType) {
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data, env);
      break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data, env);
      break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data, env);
      break;
    default:
      console.log("Unhandled event:", event.eventType);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get("env") || "sandbox") as PaddleEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
