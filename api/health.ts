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
    const hasDbUrl = !!process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    
    res.status(200).json({
      message: "Health check",
      environment: {
        NODE_ENV: nodeEnv,
        DATABASE_URL_CONFIGURED: hasDbUrl,
        DATABASE_URL_PREFIX: hasDbUrl ? process.env.DATABASE_URL?.substring(0, 20) + "..." : "not set"
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
