import crypto from "crypto";
import { Creem } from "creem";
import type { RedirectParams } from "../types/creem";

// serverIdx: 0 = production, 1 = test

const isTest = process.env.NODE_ENV !== "production";

const creem = new Creem({
  apiKey: process.env.CREEM_API_KEY!,
  serverIdx: isTest ? 1 : 0,
});

// createCheckoutSession
// this creates a ccreem checkout session for the quill Pro product
// The success_url uses the deep link scheme so the mobile WebView,
// intercepts the redirect and brings the user back into the app.

export async function createCheckoutSession(
  requestId: string,
): Promise<string> {
  const checkout = await creem.checkouts.create({
    productId: process.env.CREEM_PRODUCT_ID!,
    requestId,

    // creem will append checkout_id, order_id, customer_id, subscription_id,
    // product_id, request_id, and signature as query params on redirect
    successUrl: "quill://payment/success",
  });

  if (!checkout.checkoutUrl) {
    throw new Error("Creem did not return a checkout URL");
  }

  return checkout.checkoutUrl;
}

// verifyRedirectSignature
// we need to verify that the HMAC-SHA256 signature creem appends to the success_url redirect.

// the rules are..
// - exclude the signature param itself
// - exclude any params whose value is null or undefined
// - sort remaining params alphabetically by key
// - join as key=value pairs with &
// - Sign with HMAC-SHA256 using the API key as the secret
// ---------------------------------------------------------------------------

export function verifyRedirectSignature(params: RedirectParams): boolean {
  const { signature, ...rest } = params;

  const filtered = Object.entries(rest).filter(
    ([, value]) => value !== null && value !== undefined,
  ) as [string, string][];

  const sortedString = filtered
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const expected = crypto
    .createHmac("sha256", process.env.CREEM_API_KEY!)
    .update(sortedString)
    .digest("hex");

  // Use timingSafeEqual to prevent timing attacks
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

// this verifies the creem-signature header against the raw request body
// the payload is the raw request body string, and never the parsed json.
// the secret is the webhook secret from the Creem dashboard.

export function verifyWebhookSignature(
  rawBody: string,
  receivedSignature: string,
): boolean {
  const computed = crypto
    .createHmac("sha256", process.env.CREEM_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  const computedBuffer = Buffer.from(computed, "hex");
  const receivedBuffer = Buffer.from(receivedSignature, "hex");

  if (computedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(computedBuffer, receivedBuffer);
}
