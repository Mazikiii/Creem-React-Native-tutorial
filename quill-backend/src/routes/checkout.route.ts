import { Router, type Request, type Response } from "express";
import { createCheckoutSession } from "../services/creem.service";

const router = Router();

// POST /api/checkout
// this is called by the mobile app when the user taps "Get Quill Pro",
// it Creates a Creem checkout session and returns the checkout URL.
// The mobile app opens this URL inside a WebView.
//
// Body: { requestId?: string }
// The requestId ties this checkout to a user in your system.
// In the real app this would be the authenticated user's ID
// but for the demo it defaults to "user_demo".

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const requestId: string =
    typeof req.body?.requestId === "string" && req.body.requestId.trim()
      ? req.body.requestId.trim()
      : "user_demo";

  try {
    const rawUrl = await createCheckoutSession(requestId);

    // creem.io doesn't resolve in all regions but www.creem.io does,
    // so we rewrite the host just in case, for most users this is a no-op
    const checkoutUrl = rawUrl.replace(
      "https://creem.io",
      "https://www.creem.io",
    );

    res.status(200).json({ checkoutUrl });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session";

    console.error("[checkout] error:", message);
    res.status(500).json({ error: message });
  }
});

export default router;
