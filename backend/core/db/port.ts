// Core DB Port: minimal interface used by core services. No framework imports.
export interface DBPort {
  queryRow<T>(strings: TemplateStringsArray, ...params: any[]): Promise<T | null>;
  query<T>(strings: TemplateStringsArray, ...params: any[]): AsyncIterable<T>;
  queryAll<T>(strings: TemplateStringsArray, ...params: any[]): Promise<T[]>;
  exec(strings: TemplateStringsArray, ...params: any[]): Promise<void>;
}
