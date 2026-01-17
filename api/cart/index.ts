import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

// POST /api/cart - Add item to cart
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
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

    const { clientId, productId, quantity } = req.body;
    
    if (!clientId || !productId || !quantity) {
      res.status(400).json({ message: "clientId, productId, and quantity are required" });
      responseSent = true;
      return;
    }

    const client = await pool.connect();
    
    // Check if item already exists in cart
    const existingItem = await client.query(
      "SELECT * FROM cart_items WHERE client_id = $1 AND product_id = $2",
      [clientId, productId]
    );

    let result;
    if (existingItem.rows.length > 0) {
      // Update quantity
      result = await client.query(
        "UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 RETURNING *",
        [quantity, existingItem.rows[0].cart_id]
      );
    } else {
      // Insert new item
      result = await client.query(
        "INSERT INTO cart_items (client_id, product_id, quantity, added_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
        [clientId, productId, quantity]
      );
    }
    
    client.release();
    
    const item = result.rows[0];
    res.status(201).json({
      id: item.cart_id,
      clientId: item.client_id,
      productId: item.product_id,
      quantity: item.quantity,
      addedAt: item.added_at
    });
    responseSent = true;
  } catch (error) {
    if (!responseSent) {
      console.error("Add to Cart API Error:", error);
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
