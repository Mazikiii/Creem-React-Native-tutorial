import { Router, type Request, type Response } from "express";
import { verifyRedirectSignature } from "../services/creem.service";
import type { RedirectParams } from "../types/creem";

const router = Router();

// POST /api/verify-payment
// this is called by the mobile app after creem redirects back via deep link.
// app forwards the query params from the deep link URL to this endpoint.
// We verify the HMAC-SHA256 signature here on the server "the API key
// never leaves the backend of course"
// itll look like
// Body: RedirectParams (all fields Creem appends to the success_url)
// Response will be { verified: boolean }

router.post("/", (req: Request, res: Response): void => {
  const {
    checkout_id,
    order_id,
    customer_id,
    subscription_id,
    product_id,
    request_id,
    signature,
  } = req.body;

  // all required params must be present
  if (!checkout_id || !product_id || !signature) {
    res.status(400).json({
      verified: false,
      error: "Missing required parameters: checkout_id, product_id, signature",
    });
    return;
  }

  const params: RedirectParams = {
    checkout_id,
    order_id: order_id ?? null,
    customer_id: customer_id ?? null,
    subscription_id: subscription_id ?? null,
    product_id,
    request_id: request_id ?? null,
    signature,
  };

  const verified = verifyRedirectSignature(params);

  if (!verified) {
    console.warn(
      "[verify-payment] invalid signature for checkout:",
      checkout_id,
    );
    res.status(401).json({ verified: false, error: "Invalid signature" });
    return;
  }

  console.log("[verify-payment] verified checkout:", checkout_id);
  res.status(200).json({ verified: true });
});

export default router;
