import { registerRoutes } from "../server/routes";
import { createServer } from "http";
import express, { type Request, Response, NextFunction } from "express";

const app = express();
const httpServer = createServer(app);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export default async (req: Request, res: Response) => {
  // Initialize routes
  await registerRoutes(httpServer, app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Handle the request
  return app(req, res);
};
