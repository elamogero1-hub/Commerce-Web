import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error(
    "DATABASE_URL must be set. Check your .env file or environment variables.",
  );
}

export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle(pool, { schema });
