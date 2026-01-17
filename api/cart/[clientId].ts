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

    pool = new Pool({ 
      connectionString: dbUrl, 
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    const { clientId } = req.query;
    if (!clientId) {
      res.status(400).json({ message: "Client ID is required" });
      responseSent = true;
      return;
    }

    const client = await pool.connect();
    
    const cartResult = await client.query(`
      SELECT 
        ci.cart_id,
        ci.client_id,
        ci.product_id,
        ci.quantity,
        ci.added_at,
        p.product_id,
        p.name,
        p.price,
        p.stock,
        p.description,
        p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      WHERE ci.client_id = $1
      ORDER BY ci.added_at DESC
    `, [Number(clientId)]);
    
    client.release();
    
    const transformedItems = cartResult.rows.map((row: any) => ({
      id: row.cart_id,
      clientId: row.client_id,
      productId: row.product_id,
      quantity: row.quantity,
      addedAt: row.added_at,
      product: {
        id: row.product_id,
        name: row.name,
        price: row.price,
        stock: row.stock,
        description: row.description,
        imageUrl: row.image_url
      }
    }));
    
    res.status(200).json(transformedItems);
    responseSent = true;
  } catch (error) {
    if (!responseSent) {
      console.error("Cart API Error:", error);
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
