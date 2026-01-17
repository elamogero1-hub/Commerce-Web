import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./db";
import { products } from "@shared/schema";
import { eq } from "drizzle-orm";

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

    // Try query
    console.log("[DEBUG] Executing SELECT query...");
    const result = await db.select().from(products);
    console.log("[DEBUG] Query successful, returning results");
    
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
