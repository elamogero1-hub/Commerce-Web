import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

const { Pool } = pg;
const { products } = schema;

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

  let pool;
  let responseSent = false;
  
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set");
    }

    // Create pool with connection timeout
    pool = new Pool({ 
      connectionString: dbUrl, 
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    const db = drizzle(pool, { schema });

    const subcategoryId = req.query.subcategoryId ? Number(req.query.subcategoryId) : undefined;
    
    let query = db.select().from(products);
    if (subcategoryId) {
      query = query.where(eq(products.subcategoryId, subcategoryId)) as any;
    }
    
    const result = await query;
    res.status(200).json(result);
    responseSent = true;
  } catch (error) {
    if (!responseSent) {
      console.error("Products API Error:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      });
      responseSent = true;
    }
  } finally {
    // Always close the pool after the request
    try {
      if (pool) {
        await pool.end();
      }
    } catch (closeError) {
      console.error("Error closing pool:", closeError);
    }
  }
}
