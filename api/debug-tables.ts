import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  let pool;
  
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ error: "DATABASE_URL not set" });
    }

    pool = new Pool({ 
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 1
    });
    
    const client = await pool.connect();
    
    // Listar todas las tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Contar registros en cada tabla
    const counts: Record<string, number> = {};
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        counts[tableName] = parseInt(countResult.rows[0].count);
      } catch (e) {
        counts[tableName] = -1; // Error al contar
      }
    }
    
    // Intentar obtener algunos productos
    let productsData = null;
    try {
      const productsResult = await client.query("SELECT * FROM products LIMIT 3");
      productsData = productsResult.rows;
    } catch (e) {
      productsData = { error: String(e) };
    }
    
    client.release();
    await pool.end();
    
    res.status(200).json({
      success: true,
      tables: tablesResult.rows.map(r => r.table_name),
      recordCounts: counts,
      sampleProducts: productsData
    });
  } catch (error) {
    if (pool) {
      try { await pool.end(); } catch (e) {}
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
