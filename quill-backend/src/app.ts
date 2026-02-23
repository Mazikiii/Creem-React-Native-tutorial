import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { URLSearchParams } from "url";
import { rawBodyMiddleware } from "./middleware/rawBody";
import checkoutRouter from "./routes/checkout.route";
import verifyPaymentRouter from "./routes/verify-payment.route";
import webhookRouter from "./routes/webhook.route";

const app = express();

// webhook route must be mounted BEFORE express.json()
// creem signature verification requires the raw body string.
// express.json() destroys the original payload bytes once it parses.
app.use(
  "/api/webhooks/creem",
  rawBodyMiddleware,
  express.json(),
  webhookRouter,
);

// the other routes
app.use(express.json());

app.use("/api/checkout", checkoutRouter);
app.use("/api/verify-payment", verifyPaymentRouter);

// just a health check, hit this to confirm the server is alive
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// creem won't accept a custom scheme like quill:// as a success url, it needs https://
// so we point creem at this route instead, and it bounces the user to the deep link
// forwarding all the query params creem appended so the app can still verify them
app.get("/payment/success", (req: Request, res: Response) => {
  const params = new URLSearchParams(
    req.query as Record<string, string>,
  ).toString();
  const deepLink = `quill://payment/success${params ? `?${params}` : ""}`;

  // Use a meta-refresh + JS redirect so it works in both WebView and browser
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="0; url=${deepLink}" />
  </head>
  <body>
    <script>window.location.replace("${deepLink}");</script>
    <p>Redirecting back to Quill...</p>
  </body>
</html>`);
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
