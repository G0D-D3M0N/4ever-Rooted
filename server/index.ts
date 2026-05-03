import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { runMigrations } from "./db";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === "production";
const isVercel = !!process.env.VERCEL;

// Get custom domain from env var (e.g., CUSTOM_DOMAIN=4everrooted.com)
const customDomain = process.env.CUSTOM_DOMAIN ? `https://${process.env.CUSTOM_DOMAIN}` : null;

const allowedOrigins: (string | RegExp)[] = isProd
  ? [
      /^https:\/\/.*\.replit\.app$/,
      /^https:\/\/.*\.replit\.dev$/,
      /^https:\/\/.*\.vercel\.app$/,
      ...(customDomain ? [customDomain] : []),
    ]
  : [
      /^https?:\/\/localhost(:\d+)?$/,
      /^https:\/\/.*\.replit\.dev$/,
      /^https:\/\/.*\.pike\.replit\.dev$/,
      /^https:\/\/.*\.sisko\.replit\.dev$/,
    ];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const ok = allowedOrigins.some((pattern) =>
        pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
      );
      if (ok) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

// ── Security headers ──────────────────────────────────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (isProd) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  next();
});

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(
  express.json({
    limit: "50kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false, limit: "50kb" }));

// ── Request logging ───────────────────────────────────────────────────────────
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
// Run DB migrations (idempotent — safe to run on every startup)
await runMigrations();

// Register all API routes
await registerRoutes(httpServer, app);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message =
    isProd && status === 500
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(status).json({ message });
  if (status >= 500) console.error(err);
});

// On Vercel: static files are served by the CDN (outputDirectory in vercel.json)
// so we skip serveStatic() and listen() — Vercel manages the HTTP lifecycle.
if (!isVercel) {
  if (isProd) {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "3000", 10);
  httpServer.timeout = 180_000;
  httpServer.keepAliveTimeout = 180_000;
  httpServer.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });
}

// ── Vercel serverless export ──────────────────────────────────────────────────
// When bundled as ESM for Vercel, this default export IS the serverless handler.
export default app;
