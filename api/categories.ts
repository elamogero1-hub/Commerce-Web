import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./db";
import { categories, subcategories } from "@shared/schema";
import { eq } from "drizzle-orm";

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

  try {
    const cats = await db.select().from(categories);
    const result = [];
    for (const cat of cats) {
      const subs = await db.select().from(subcategories).where(eq(subcategories.categoryId, cat.id));
      result.push({ ...cat, subcategories: subs });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Categories API Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
}
