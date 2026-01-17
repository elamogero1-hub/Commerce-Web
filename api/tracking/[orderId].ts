import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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

    if (req.method === "GET") {
      // Get tracking for an order
      const { orderId } = req.query;

      if (!orderId || isNaN(Number(orderId))) {
        res.status(400).json({ message: "Order ID is required" });
        responseSent = true;
        return;
      }

      console.log("Fetching tracking for order:", orderId);

      const result = await client.query(
        `SELECT dt.tracking_id as id, dt.order_id as "orderId", dt.status_id as "statusId", 
                dt.timestamp, dt.comment,
                os.name as "statusName"
         FROM delivery_tracking dt
         LEFT JOIN order_states os ON dt.status_id = os.state_id
         WHERE dt.order_id = $1
         ORDER BY dt.timestamp ASC`,
        [Number(orderId)]
      );

      const tracking = result.rows.map(row => ({
        ...row,
        status: {
          id: row.statusId,
          name: row.statusName
        }
      }));

      client.release();
      res.status(200).json(tracking);
      responseSent = true;
    } else if (req.method === "POST") {
      // Add tracking update
      const { orderId, statusId, comment } = req.body;

      if (!orderId || !statusId) {
        res.status(400).json({ message: "Order ID and Status ID are required" });
        responseSent = true;
        return;
      }

      console.log("Adding tracking for order:", orderId);

      const result = await client.query(
        `INSERT INTO delivery_tracking (order_id, status_id, timestamp, comment) 
         VALUES ($1, $2, NOW(), $3)
         RETURNING tracking_id as id, order_id as "orderId", status_id as "statusId", 
                   timestamp, comment`,
        [Number(orderId), Number(statusId), comment || null]
      );

      client.release();
      res.status(201).json(result.rows[0]);
      responseSent = true;
    }
  } catch (error) {
    if (!responseSent) {
      console.error("Tracking API error:", error);
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
