import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const logs: string[] = [];
  let pool;
  
  try {
    logs.push("Step 1: Handler started");
    
    const dbUrl = process.env.DATABASE_URL;
    logs.push(`Step 2: DATABASE_URL ${dbUrl ? 'exists' : 'missing'}`);
    
    if (!dbUrl) {
      return res.status(500).json({ error: "DATABASE_URL not set", logs });
    }

    logs.push("Step 3: Creating pool...");
    pool = new Pool({ 
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    logs.push("Step 4: Pool created, testing connection...");
    const client = await pool.connect();
    logs.push("Step 5: Client connected");
    
    logs.push("Step 6: Running test query...");
    const result = await client.query("SELECT NOW() as time, 1 as test");
    logs.push("Step 7: Query successful");
    
    client.release();
    logs.push("Step 8: Client released");
    
    await pool.end();
    logs.push("Step 9: Pool closed");
    
    res.status(200).json({
      success: true,
      message: "Database connection successful",
      queryResult: result.rows[0],
      logs
    });
  } catch (error) {
    logs.push(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
    
    try {
      if (pool) await pool.end();
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
