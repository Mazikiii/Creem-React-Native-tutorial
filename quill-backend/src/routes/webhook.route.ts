import { Router, type Response } from "express";
import { verifyWebhookSignature } from "../services/creem.service";
import { processWebhookEvent } from "../services/webhook.service";
import type { CreemWebhookEvent, RawBodyRequest } from "../types/creem";

const router = Router();

// POST /api/webhooks/creem
// creem will send webhook events here for every payment lifecycle event.
// the signature verification uses the raw request body and not the parsed JSON.
// this is the main reason why we capture rawBody in the middleware before express.json() parses it

// respond with HTTP 200 to acknowledge receipt.
// and put creem retries with progressive backoff: 30s, 1m, 5m, 1h.

router.post("/", (req: RawBodyRequest, res: Response): void => {
  const signature = req.headers["creem-signature"];

  if (!signature || typeof signature !== "string") {
    console.warn("[webhook] missing creem-signature header");
    res.status(400).json({ error: "Missing signature header" });
    return;
  }

  if (!req.rawBody) {
    console.warn("[webhook] raw body not available — check middleware order");
    res.status(400).json({ error: "Raw body unavailable" });
    return;
  }

  const isValid = verifyWebhookSignature(
    req.rawBody.toString("utf8"),
    signature,
  );

  if (!isValid) {
    console.warn("[webhook] invalid signature — possible spoofed request");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  let event: CreemWebhookEvent;

  try {
    event = req.body as CreemWebhookEvent;
  } catch {
    res.status(400).json({ error: "Invalid JSON payload" });
    return;
  }

  if (!event.eventType) {
    res.status(400).json({ error: "Missing eventType in payload" });
    return;
  }

  // acknowledge immediately, then creem expects a  200
  // any slow processing should happen asynchronously
  res.status(200).json({ received: true });

  // processs after responding so creem never times out waiting for us
  try {
    processWebhookEvent(event);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      "[webhook] error processing event:",
      event.eventType,
      message,
    );
  }
});

export default router;
