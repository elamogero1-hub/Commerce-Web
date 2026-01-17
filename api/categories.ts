import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

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
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    const client = await pool.connect();
    
    const catsResult = await client.query("SELECT * FROM categories ORDER BY category_id");
    const result = [];
    
    for (const cat of catsResult.rows) {
      const subsResult = await client.query(
        "SELECT * FROM subcategories WHERE category_id = $1 ORDER BY subcategory_id",
        [cat.category_id]
      );
      result.push({ 
        id: cat.category_id,
        name: cat.name,
        description: cat.description,
        subcategories: subsResult.rows.map((sub: any) => ({
          id: sub.subcategory_id,
          categoryId: sub.category_id,
          name: sub.name
        }))
      });
    }
    
    client.release();
    
    res.status(200).json(result);
    responseSent = true;
  } catch (error) {
    if (!responseSent) {
      console.error("Categories API Error:", error);
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
