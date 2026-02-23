import type { Response, NextFunction } from "express";
import type { RawBodyRequest } from "../types/creem";

// first we need something that captures the raw request body as a Buffer before express.json() parses it.
// webhook signature verification requires the exact raw payload string,
// once JSON.parse runs, the original byte sequence is lost.
// so mount this BEFORE express.json() on the webhook route only.

export function rawBodyMiddleware(
  req: RawBodyRequest,
  _res: Response,
  next: NextFunction,
): void {
  const chunks: Buffer[] = [];

  req.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

  req.on("end", () => {
    req.rawBody = Buffer.concat(chunks);
    next();
  });

  req.on("error", (err) => {
    next(err);
  });
}
