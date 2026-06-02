import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import webhookRouter from "./routes/webhooks";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));

// ── Webhook route: raw body MUST be preserved for HMAC-SHA512 verification.
// Mount with express.raw() BEFORE the global express.json() middleware so the
// body stream is not consumed and parsed away.
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json", limit: "1mb" }),
  webhookRouter,
);

// ── General body parsers (all other routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
