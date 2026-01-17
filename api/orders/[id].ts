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

    const client = await pool.connect();
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "Invalid order ID" });
      responseSent = true;
      return;
    }

    console.log("Fetching order details for ID:", id);

    // Get order details
    const orderResult = await client.query(
      `SELECT o.order_id as id, o.client_id as "clientId", o.payment_method_id as "paymentMethodId", 
              o.status_id as "statusId", o.total, o.order_date as "orderDate",
              os.name as status
       FROM orders o
       LEFT JOIN order_states os ON o.status_id = os.state_id
       WHERE o.order_id = $1`,
      [Number(id)]
    );

    if (orderResult.rows.length === 0) {
      res.status(404).json({ message: "Order not found" });
      responseSent = true;
      client.release();
      return;
    }

    const order = {
      ...orderResult.rows[0],
      total: parseFloat(String(orderResult.rows[0].total))
    };

    // Get order items (optional)
    let items = [];
    try {
      const itemsResult = await client.query(
        `SELECT oi.detail_id as id, oi.order_id as "orderId", oi.product_id as "productId", 
                oi.quantity, oi.historical_price as "historicalPrice",
                p.name, p.price, p.image_url as "imageUrl"
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.product_id
         WHERE oi.order_id = $1`,
        [Number(id)]
      );
      items = itemsResult.rows.map(item => ({
        ...item,
        historicalPrice: parseFloat(String(item.historicalPrice)),
        price: item.price ? parseFloat(String(item.price)) : null,
        product: {
          id: item.productId,
          name: item.name,
          price: item.price ? parseFloat(String(item.price)) : null,
          imageUrl: item.imageUrl
        }
      }));
    } catch (itemError) {
      console.log("Note: Could not fetch order items:", itemError);
    }

    // Get tracking updates
    let tracking = [];
    try {
      const trackingResult = await client.query(
        `SELECT dt.tracking_id as id, dt.order_id as "orderId", dt.status_id as "statusId", 
                dt.timestamp, dt.comment,
                os.name as "statusName"
         FROM delivery_tracking dt
         LEFT JOIN order_states os ON dt.status_id = os.state_id
         WHERE dt.order_id = $1
         ORDER BY dt.timestamp ASC`,
        [Number(id)]
      );
      tracking = trackingResult.rows.map(t => ({
        ...t,
        status: {
          id: t.statusId,
          name: t.statusName
        }
      }));
    } catch (trackingError) {
      console.log("Note: Could not fetch tracking info:", trackingError);
    }

    client.release();

    res.status(200).json({
      ...order,
      items,
      tracking
    });
    responseSent = true;
  } catch (error) {
    if (!responseSent) {
      console.error("Order details error:", error);
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
