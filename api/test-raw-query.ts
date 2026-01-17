import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const logs: string[] = [];
  let pool;
  
  try {
    logs.push("Step 1: Starting raw SQL query test");
    
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ error: "DATABASE_URL not set", logs });
    }

    logs.push("Step 2: Creating pool with SSL");
    pool = new Pool({ 
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 10000
    });
    
    logs.push("Step 3: Connecting to database...");
    const client = await pool.connect();
    logs.push("Step 4: Connected successfully");
    
    logs.push("Step 5: Querying products table...");
    const result = await client.query("SELECT id, name, price, stock FROM products LIMIT 5");
    logs.push(`Step 6: Query returned ${result.rows.length} rows`);
    
    client.release();
    logs.push("Step 7: Client released");
    
    await pool.end();
    logs.push("Step 8: Pool closed");
    
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: result.rows.length,
      products: result.rows,
      logs
    });
  } catch (error) {
    logs.push(`ERROR at step: ${error instanceof Error ? error.message : String(error)}`);
    
    try {
      if (pool) await pool.end();
      logs.push("Cleanup successful");
    } catch (e) {
      logs.push(`Cleanup error: ${e}`);
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      logs
    });
  }
}
