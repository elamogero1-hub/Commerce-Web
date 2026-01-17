import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

// DELETE /api/cart/:id - Remove item from cart
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "DELETE") {
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

    pool = new Pool({ 
      connectionString: dbUrl, 
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    const { id } = req.query;
    
    if (!id) {
      res.status(400).json({ message: "Cart item ID is required" });
      responseSent = true;
      return;
    }

    const client = await pool.connect();
    
    const result = await client.query(
      "DELETE FROM cart_items WHERE cart_id = $1",
      [Number(id)]
    );
    
    client.release();
    
    if (result.rowCount === 0) {
      res.status(404).json({ message: "Cart item not found" });
      responseSent = true;
      return;
    }
    
    res.status(204).end();
    responseSent = true;
  } catch (error) {
    if (!responseSent) {
      console.error("Remove from Cart API Error:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      });
      responseSent = true;
    }
  } finally {
    try {
      if (pool) {
        await pool.end();
      }
    } catch (closeError) {
      console.error("Error closing pool:", closeError);
    }
  }
}
