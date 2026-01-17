import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

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

    const client = await pool.connect();
    const { orderId, statusId, comment } = req.body;

    if (!orderId || !statusId) {
      res.status(400).json({ message: "Order ID and Status ID are required" });
      responseSent = true;
      client.release();
      return;
    }

    console.log("Adding tracking for order:", orderId);

    const result = await client.query(
      `INSERT INTO delivery_tracking (order_id, status_id, timestamp, comment) 
       VALUES ($1, $2, NOW(), $3) 
       RETURNING tracking_id as id, order_id as "orderId", status_id as "statusId", timestamp, comment`,
      [Number(orderId), Number(statusId), comment || null]
    );

    client.release();
    
    res.status(201).json(result.rows[0]);
    responseSent = true;
  } catch (error) {
    if (!responseSent) {
      console.error("Tracking error:", error);
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
