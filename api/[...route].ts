import type { VercelRequest, VercelResponse } from "@vercel/node";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";
import express, { type Request, Response, NextFunction } from "express";

let app: any = null;
let httpServer: any = null;

const initializeApp = () => {
  if (app) return;

  const newApp = express();
  const newHttpServer = createServer(newApp);

  newApp.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );

  newApp.use(express.urlencoded({ extended: false }));

  // Initialize routes
  registerRoutes(newHttpServer, newApp).catch((err) => {
    console.error("Error registering routes:", err);
  });

  // Error handler middleware
  newApp.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("API Error:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  app = newApp;
  httpServer = newHttpServer;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  initializeApp();
  
  // Handle CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  return app(req, res);
}
