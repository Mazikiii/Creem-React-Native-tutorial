import type { Request } from "express";

export type CreemWebhookEventType =
  | "checkout.completed"
  | "subscription.active"
  | "subscription.paid"
  | "subscription.canceled"
  | "subscription.scheduled_cancel"
  | "subscription.past_due"
  | "subscription.expired"
  | "subscription.update"
  | "subscription.trialing"
  | "subscription.paused"
  | "refund.created"
  | "dispute.created";

export type CreemProduct = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  price: number;
  currency: string;
  billing_type: "recurring" | "one_time";
  billing_period: string;
  status: string;
  tax_mode: string;
  tax_category: string;
  default_success_url: string;
  created_at: string;
  updated_at: string;
  mode: string;
};

export type CreemCustomer = {
  id: string;
  object: "customer";
  email: string;
  name: string;
  country: string;
  created_at: string;
  updated_at: string;
  mode: string;
};

export type CreemOrder = {
  id: string;
  customer: string;
  product: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
  mode: string;
};

export type CreemSubscription = {
  id: string;
  object: "subscription";
  product: CreemProduct | string;
  customer: CreemCustomer | string;
  collection_method: string;
  status:
    | "active"
    | "canceled"
    | "past_due"
    | "expired"
    | "trialing"
    | "paused"
    | "scheduled_cancel";
  last_transaction_id?: string;
  last_transaction_date?: string;
  next_transaction_date?: string;
  current_period_start_date?: string;
  current_period_end_date?: string;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  mode: string;
};

export type CreemCheckoutObject = {
  id: string;
  object: "checkout";
  request_id?: string;
  order?: CreemOrder;
  product?: CreemProduct;
  customer?: CreemCustomer;
  subscription?: CreemSubscription;
  custom_fields: unknown[];
  status: string;
  metadata?: Record<string, unknown>;
  mode: string;
};

// webhook event envelope

export type CheckoutCompletedEvent = {
  id: string;
  eventType: "checkout.completed";
  created_at: number;
  object: CreemCheckoutObject;
};

export type SubscriptionEvent = {
  id: string;
  eventType: Extract<
    CreemWebhookEventType,
    | "subscription.active"
    | "subscription.paid"
    | "subscription.canceled"
    | "subscription.scheduled_cancel"
    | "subscription.past_due"
    | "subscription.expired"
    | "subscription.update"
    | "subscription.trialing"
    | "subscription.paused"
  >;
  created_at: number;
  object: CreemSubscription;
};

export type CreemWebhookEvent = CheckoutCompletedEvent | SubscriptionEvent;

// redirect signature verification params so that creem appends to success_url
// null values must be excluded from the hmac string

export type RedirectParams = {
  checkout_id: string;
  order_id: string | null;
  customer_id: string | null;
  subscription_id: string | null;
  product_id: string;
  request_id?: string | null;
  signature: string;
};

// need an extend Express Request to carry the raw body for webhook verification
// creem signature is verified against the raw request payload

export interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}
