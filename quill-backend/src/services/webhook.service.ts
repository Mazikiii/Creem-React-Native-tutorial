import type {
  CreemWebhookEvent,
  CheckoutCompletedEvent,
  SubscriptionEvent,
} from "../types/creem"

// ---------------------------------------------------------------------------
// Webhook handler service
// Each function handles one Creem event type.
// In a real production app these would write to a database.
// For the demo they log clearly so the tutorial reader can see exactly
// what data Creem sends for each lifecycle event.
// ---------------------------------------------------------------------------

function handleCheckoutCompleted(event: CheckoutCompletedEvent): void {
  const { object } = event
  const customer = object.customer
  const subscription = object.subscription
  const metadata = object.metadata

  console.log("[webhook] checkout.completed")
  console.log("  checkout_id  :", object.id)
  console.log("  request_id   :", object.request_id ?? "—")
  console.log("  customer     :", customer?.email ?? "—")
  console.log("  subscription :", subscription?.id ?? "—")
  console.log("  metadata     :", JSON.stringify(metadata ?? {}))

  // Production: look up the user by request_id (which we set to a userId)
  // and grant them Pro access in your database.
}

function handleSubscriptionPaid(event: SubscriptionEvent): void {
  const { object } = event
  const customer =
    typeof object.customer === "object" ? object.customer : null

  console.log("[webhook] subscription.paid")
  console.log("  subscription_id :", object.id)
  console.log("  status          :", object.status)
  console.log("  customer        :", customer?.email ?? object.customer)
  console.log("  next_billing    :", object.next_transaction_date ?? "—")

  // Production: this is the authoritative event for granting access.
  // Creem recommends using subscription.paid (not subscription.active)
  // to activate access.
}

function handleSubscriptionCanceled(event: SubscriptionEvent): void {
  const { object } = event
  const customer =
    typeof object.customer === "object" ? object.customer : null

  console.log("[webhook] subscription.canceled")
  console.log("  subscription_id :", object.id)
  console.log("  canceled_at     :", object.canceled_at ?? "—")
  console.log("  customer        :", customer?.email ?? object.customer)

  // Production: revoke Pro access for this customer.
}

function handleSubscriptionScheduledCancel(event: SubscriptionEvent): void {
  const { object } = event

  console.log("[webhook] subscription.scheduled_cancel")
  console.log("  subscription_id       :", object.id)
  console.log("  access_until          :", object.current_period_end_date ?? "—")

  // Production: notify the user their access ends at current_period_end_date.
  // You can still resume via the Creem resume endpoint before that date.
}

function handleSubscriptionPastDue(event: SubscriptionEvent): void {
  const { object } = event

  console.log("[webhook] subscription.past_due")
  console.log("  subscription_id :", object.id)
  console.log("  status          :", object.status)

  // Production: notify the user their payment failed.
  // Creem will retry automatically — do not revoke access yet.
}

function handleSubscriptionExpired(event: SubscriptionEvent): void {
  const { object } = event

  console.log("[webhook] subscription.expired")
  console.log("  subscription_id :", object.id)

  // Production: begin revoking access. The subscription is terminal
  // only once status transitions to "canceled".
}

function handleSubscriptionTrialing(event: SubscriptionEvent): void {
  const { object } = event

  console.log("[webhook] subscription.trialing")
  console.log("  subscription_id       :", object.id)
  console.log("  trial_ends            :", object.current_period_end_date ?? "—")

  // Production: grant trial access and surface the trial end date in your UI.
}

function handleSubscriptionPaused(event: SubscriptionEvent): void {
  const { object } = event

  console.log("[webhook] subscription.paused")
  console.log("  subscription_id :", object.id)

  // Production: pause access — do not cancel. Access can be resumed.
}

// ---------------------------------------------------------------------------
// processWebhookEvent — the single entry point called by the route handler
// ---------------------------------------------------------------------------

export function processWebhookEvent(event: CreemWebhookEvent): void {
  switch (event.eventType) {
    case "checkout.completed":
      handleCheckoutCompleted(event)
      break

    // Creem recommends subscription.paid as the authoritative grant-access event
    case "subscription.paid":
      handleSubscriptionPaid(event)
      break

    case "subscription.canceled":
      handleSubscriptionCanceled(event)
      break

    case "subscription.scheduled_cancel":
      handleSubscriptionScheduledCancel(event)
      break

    case "subscription.past_due":
      handleSubscriptionPastDue(event)
      break

    case "subscription.expired":
      handleSubscriptionExpired(event)
      break

    case "subscription.trialing":
      handleSubscriptionTrialing(event)
      break

    case "subscription.paused":
      handleSubscriptionPaused(event)
      break

    // subscription.active is for sync only per Creem docs — log and skip
    case "subscription.active":
      console.log("[webhook] subscription.active — sync only, no action taken")
      break

    case "subscription.update":
      console.log("[webhook] subscription.update — id:", event.object.id)
      break

    default: {
      const unhandled = (event as CreemWebhookEvent).eventType
      console.warn("[webhook] unhandled event type:", unhandled)
    }
  }
}
