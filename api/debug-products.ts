import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;
const { products } = schema;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    console.log("[DEBUG] Starting debug-products endpoint");
    console.log("[DEBUG] NODE_ENV:", process.env.NODE_ENV);
    console.log("[DEBUG] DATABASE_URL set:", !!process.env.DATABASE_URL);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL not set");
    }

    const pool = new Pool({ connectionString: dbUrl });
    const db = drizzle(pool, { schema });

    // Try query
    console.log("[DEBUG] Executing SELECT query...");
    const result = await db.select().from(products);
    console.log("[DEBUG] Query successful, returning results");
    
    await pool.end();
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      status: "success",
      productCount: result.length,
      products: result.slice(0, 5), // First 5 products
      allProductsCount: result.length
    });
  } catch (error) {
    console.error("[ERROR] Debug products error:", error);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: "error",
      error: String(error),
      stack: (error as any)?.stack,
      message: "Failed to fetch products"
    });
  }
}
