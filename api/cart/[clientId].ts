import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DatabaseStorage } from "../../server/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
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

  try {
    const { clientId } = req.query;
    if (!clientId) {
      res.status(400).json({ message: "Client ID is required" });
      return;
    }

    const storage = new DatabaseStorage();
    const cart = await storage.getCart(Number(clientId));
    res.status(200).json(cart);
  } catch (error) {
    console.error("Cart API Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
}
