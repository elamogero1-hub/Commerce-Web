import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.status(200).end();
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

    if (req.method === "POST") {
      // Create order
      const { clientId, paymentMethodId, items } = req.body;
      
      if (!clientId || !paymentMethodId || !items || items.length === 0) {
        res.status(400).json({ message: "Missing required fields" });
        responseSent = true;
        return;
      }

      // Calculate total
      const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

      // Create order (status_id = 1 for "Pendiente")
      const orderResult = await client.query(
        `INSERT INTO orders (client_id, payment_method_id, status_id, total) 
         VALUES ($1, $2, 1, $3) 
         RETURNING order_id as id, client_id as clientId, payment_method_id as paymentMethodId, 
                   status_id as statusId, total, created_at as createdAt`,
        [clientId, paymentMethodId, total]
      );

      const orderId = orderResult.rows[0].id;

      // Add order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price) 
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.productId, item.quantity, item.price]
        );
      }

      // Clear cart items
      await client.query(
        `DELETE FROM cart_items WHERE client_id = $1`,
        [clientId]
      );

      client.release();
      
      res.status(201).json(orderResult.rows[0]);
      responseSent = true;
    } else if (req.method === "GET") {
      // Get orders by clientId
      const { clientId } = req.query;
      
      if (!clientId) {
        res.status(400).json({ message: "Client ID is required" });
        responseSent = true;
        return;
      }

      const result = await client.query(
        `SELECT o.order_id as id, o.client_id as clientId, o.payment_method_id as paymentMethodId, 
                o.status_id as statusId, o.total, o.created_at as createdAt,
                os.name as status
         FROM orders o
         LEFT JOIN order_states os ON o.status_id = os.state_id
         WHERE o.client_id = $1
         ORDER BY o.created_at DESC`,
        [clientId]
      );

      client.release();
      res.status(200).json(result.rows);
      responseSent = true;
    }
  } catch (error) {
    if (!responseSent) {
      console.error("Orders API Error:", error);
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
