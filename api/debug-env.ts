import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT_SET",
    PGHOST: process.env.PGHOST ? "SET" : "NOT_SET",
    PGPORT: process.env.PGPORT ? "SET" : "NOT_SET",
    PGUSER: process.env.PGUSER ? "SET" : "NOT_SET",
    PGPASSWORD: process.env.PGPASSWORD ? "SET" : "NOT_SET",
    PGDATABASE: process.env.PGDATABASE ? "SET" : "NOT_SET",
    NODE_ENV: process.env.NODE_ENV || "NOT_SET",
    ALL_KEYS: Object.keys(process.env).filter(k => !k.startsWith("VERCEL") && !k.startsWith("AWS")).sort()
  };

  res.status(200).json(envVars);
}
