import pg from "pg";
import { config } from "../config";

export function createPool(): pg.Pool {
  return new pg.Pool({ connectionString: config.databaseUrl(), max: 10 });
}
