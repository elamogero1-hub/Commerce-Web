import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  try {
    const dbUrl = process.env.DATABASE_URL;
    
    // Check environment variables
    const envStatus = {
      DATABASE_URL_SET: !!dbUrl,
      DATABASE_URL_LENGTH: dbUrl?.length || 0,
      DATABASE_URL_STARTS_WITH: dbUrl?.substring(0, 50) || "NOT_SET",
      NODE_ENV: process.env.NODE_ENV,
      PGHOST: process.env.PGHOST ? "SET" : "NOT_SET",
      PGPORT: process.env.PGPORT ? "SET" : "NOT_SET",
      PGUSER: process.env.PGUSER ? "SET" : "NOT_SET",
      PGPASSWORD: process.env.PGPASSWORD ? "SET" : "NOT_SET",
      PGDATABASE: process.env.PGDATABASE ? "SET" : "NOT_SET"
    };

    // Try to connect to database
    let dbStatus = {
      imported: true,
      connected: false,
      error: null as string | null,
      result: null as any
    };

    try {
      // Try a simple query
      const result = await db.execute("SELECT 1 as connected");
      dbStatus.connected = true;
      dbStatus.result = result;
    } catch (queryError) {
      dbStatus.error = `Query failed: ${String(queryError)}`;
    }

    res.status(200).json({
      timestamp: new Date().toISOString(),
      environment: envStatus,
      database: dbStatus,
      message: dbStatus.connected ? "Database connected successfully" : "Database connection failed"
    });
  } catch (error) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      error: String(error),
      message: "Debug endpoint error"
    });
  }
}

