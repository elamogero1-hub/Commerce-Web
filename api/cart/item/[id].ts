import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

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

    const client = await pool.connect();
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "Invalid cart item ID" });
      responseSent = true;
      return;
    }

    console.log("Deleting cart item with ID:", id);

    const result = await client.query(
      `DELETE FROM cart_items WHERE cart_id = $1 RETURNING cart_id as id`,
      [Number(id)]
    );

    client.release();

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Cart item not found" });
      responseSent = true;
      return;
    }

    res.status(200).json({ success: true, id: result.rows[0].id });
    responseSent = true;
  } catch (error) {
    if (!responseSent) {
      console.error("Delete cart item error:", error);
      res.status(500).json({
        message: "Failed to remove item from cart",
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
