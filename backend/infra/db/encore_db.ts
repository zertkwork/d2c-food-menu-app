// Encore-backed DB implementation of the core DB port.
// This file isolates Encore from the core domain.
import coreDb from "../../db/index";
import type { DBPort } from "../../core/db/port";

class EncoreDB implements DBPort {
  async queryRow<T>(strings: TemplateStringsArray, ...params: any[]): Promise<T | null> {
    const row = await coreDb.queryRow<T>(strings, ...params);
    return (row as any) ?? null;
  }

  async *query<T>(strings: TemplateStringsArray, ...params: any[]): AsyncIterable<T> {
    for await (const r of coreDb.query<T>(strings, ...params)) {
      yield r as any as T;
    }
  }

  async queryAll<T>(strings: TemplateStringsArray, ...params: any[]): Promise<T[]> {
    const rows = await coreDb.queryAll<T>(strings, ...params);
    return rows as any as T[];
  }

  async exec(strings: TemplateStringsArray, ...params: any[]): Promise<void> {
    await coreDb.exec(strings, ...params);
  }
}

const db: DBPort = new EncoreDB();
export default db;
