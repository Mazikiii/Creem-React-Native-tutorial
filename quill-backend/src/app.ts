import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
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

// a health check to confirm the deployed server is reachable
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
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
