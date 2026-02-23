import crypto from "crypto";
import { Creem } from "creem";
import type { RedirectParams } from "../types/creem";

// serverIdx 0 = production, 1 = test

const isTest = process.env.NODE_ENV !== "production";

const creem = new Creem({
  apiKey: process.env.CREEM_API_KEY!,
  serverIdx: isTest ? 1 : 0,
});

// creates a creem checkout session for the quill pro product,
// success_url points at our own /payment/success route on the backend
// which then bounces the user back into the app via the quill:// deep link

export async function createCheckoutSession(
  requestId: string,
): Promise<string> {
  const successUrl = `${process.env.BACKEND_URL}/payment/success`;
  console.log("[checkout] BACKEND_URL:", process.env.BACKEND_URL);
  console.log("[checkout] successUrl being sent to creem:", successUrl);

  const checkout = await creem.checkouts.create({
    productId: process.env.CREEM_PRODUCT_ID!,
    requestId,
    successUrl,
  });

  if (!checkout.checkoutUrl) {
    throw new Error("Creem did not return a checkout URL");
  }

  return checkout.checkoutUrl;
}

// verifyRedirectSignature
// verifies the hmac-sha256 signature creem appends to the success url redirect
// rules are, exclude the signature itself, exclude null/undefined params,
// sort the rest alphabetically, join as key=value with &, sign with hmac-sha256 using the api key

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

// verifies the creem-signature header against the raw request body,
// has to be the raw body string, not the parsed json, express.json() destroys it
// the secret comes from the creem dashboard under developers > webhooks

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
