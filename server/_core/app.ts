import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

/**
 * Build and configure the Express application. This function encapsulates all
 * middleware and route registration so that the app can be used both in
 * serverless environments (e.g. Vercel) and traditional servers. It does
 * **not** start listening on a port; that responsibility remains with the
 * caller. When running in development mode the Vite dev server is mounted
 * (which requires an HTTP server), otherwise static files are served from
 * the `public` directory.
 */
export async function createApp() {
  const app = express();
  const server = createServer(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // In development attach the Vite middleware for hot module reloading
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    // In production, serve static files from the root-level public directory.
    // NOTE: On Vercel, express.static is ignored and static assets must live
    // under the `public/` folder. See the "Express on Vercel" docs: assets
    // placed in the `public/**` directory are automatically served via CDN
    // and express.static() calls are ignored【382487564759194†screenshot】.
    serveStatic(app);
  }

  return app;
}