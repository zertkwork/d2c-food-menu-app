// Postgres-backed DB implementation of the core DB port using 'pg'.
// Reads configuration from env (DATABASE_URL).
// NOTE: This file is used by adapters; core must depend only on the DBPort interface.

import type { DBPort } from "../../core/db/port";
import { Pool } from "pg";

// Create a pool using DATABASE_URL
const connectionString = process.env.DATABASE_URL || "";
const pool = new Pool({ connectionString });

// Helper: convert tagged template (strings, ...params) into text + values with $1, $2 placeholders
function toQuery(strings: TemplateStringsArray, params: any[]) {
  let text = strings[0] || "";
  for (let i = 0; i < params.length; i++) {
    text += `$${i + 1}` + (strings[i + 1] || "");
  }
  return { text, values: params };
}

class PostgresDB implements DBPort {
  async queryRow<T>(strings: TemplateStringsArray, ...params: any[]): Promise<T | null> {
    const { text, values } = toQuery(strings, params);
    const res = await pool.query(text, values) as any;
    return (res.rows && res.rows[0]) ?? null;
  }

  async *query<T>(strings: TemplateStringsArray, ...params: any[]): AsyncIterable<T> {
    const { text, values } = toQuery(strings, params);
    const res = await pool.query(text, values) as any;
    for (const row of res.rows as any[]) {
      yield row as T;
    }
  }

  async queryAll<T>(strings: TemplateStringsArray, ...params: any[]): Promise<T[]> {
    const { text, values } = toQuery(strings, params);
    const res = await pool.query(text, values) as any;
    return (res.rows as any[]) as T[];
  }

  async exec(strings: TemplateStringsArray, ...params: any[]): Promise<void> {
    const { text, values } = toQuery(strings, params);
    await pool.query(text, values);
  }
}

const db: DBPort = new PostgresDB();
export default db;
