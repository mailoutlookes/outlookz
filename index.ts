/**
 * Root entrypoint for the Express app on Vercel.
 *
 * Vercel recognises certain filenames (such as `index.ts`, `app.ts`,
 * `server.ts` and their JS equivalents) as the entrypoint for a backend
 * Node.js function【773685664004539†screenshot】. Exporting an Express application
 * from this file causes Vercel to package it as a single serverless
 * function using Fluid compute【382487564759194†screenshot】. Static assets should
 * be placed in the `public/` directory at the root of the project;
 * `express.static()` calls will be ignored on Vercel【382487564759194†screenshot】.
 */
import { createApp } from "./server/_core/app";

// Immediately build the app when the module is imported. This ensures that
// asynchronous middleware (e.g. Vite in development) is ready before the
// app handles any requests.
const appPromise = createApp();

// Vercel will invoke the default export, so we return an async handler
// that resolves the built app and forwards requests to it. Express apps
// are functions `(req, res)` so this works transparently.
export default async function handler(req: any, res: any) {
  const app = await appPromise;
  return (app as any)(req, res);
}