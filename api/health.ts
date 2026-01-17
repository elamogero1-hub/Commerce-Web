import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const dbUrl = process.env.DATABASE_URL;
    const hasDbUrl = !!dbUrl;
    const nodeEnv = process.env.NODE_ENV;
    
    // Try to import and test the database connection
    let dbConnected = false;
    let dbError = null;
    
    try {
      if (hasDbUrl) {
        const { db } = await import("../lib/db");
        // Try a simple query to verify connection
        const result = await db.execute("SELECT 1");
        dbConnected = true;
      }
    } catch (error) {
      dbError = String(error);
    }
    
    res.status(200).json({
      message: "Health check",
      environment: {
        NODE_ENV: nodeEnv,
        DATABASE_URL_CONFIGURED: hasDbUrl,
        DATABASE_URL_PREFIX: hasDbUrl ? dbUrl?.substring(0, 30) + "..." : "not set",
        DATABASE_URL_LENGTH: dbUrl?.length || 0,
        DB_CONNECTED: dbConnected,
        DB_ERROR: dbError,
        ALL_ENV_KEYS: Object.keys(process.env).filter(k => k.startsWith("PG") || k === "DATABASE_URL" || k === "NODE_ENV")
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      message: "Health check failed",
      error: String(error)
    });
  }
}
