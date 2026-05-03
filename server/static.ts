import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In Vercel serverless functions, __dirname is the function's directory
  // We need to resolve to the dist/public directory
  const distPath = path.resolve(process.cwd(), "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    console.log("Looking for static files in:", distPath);
    console.log("Available files:", fs.readdirSync(path.resolve(process.cwd(), "dist")));
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  console.log("Serving static files from:", distPath);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
