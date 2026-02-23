import app from "./app";

// validate environment
// it should fail fast on startup if required variables are missing.

const REQUIRED_ENV = [
  "CREEM_API_KEY",
  "CREEM_WEBHOOK_SECRET",
  "CREEM_PRODUCT_ID",
] as const;

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[server] missing required environment variable: ${key}`);
    console.error("[server] copy env.example to .env and fill in your values");
    process.exit(1);
  }
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = app.listen(PORT, () => {
  const env = process.env.NODE_ENV ?? "development";
  console.log(`[server] quill-backend running on port ${PORT} (${env})`);
  console.log(`[server] health check → http://localhost:${PORT}/health`);
  console.log(`[server] endpoints:`);
  console.log(`         POST /api/checkout`);
  console.log(`         POST /api/verify-payment`);
  console.log(`         POST /api/webhooks/creem`);
});

// perform a Graceful shutdown, it allows in-flight requests to complete
process.on("SIGTERM", () => {
  console.log("[server] SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("[server] closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("[server] SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("[server] closed");
    process.exit(0);
  });
});
