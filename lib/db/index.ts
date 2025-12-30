import * as schema from "./schema";

const dbDialect = process.env.DB_DIALECT ?? "sqlite";

function createDatabase() {
  if (dbDialect === "postgres") {
    // PostgreSQL with node-postgres
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/node-postgres");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    return drizzle({ client: pool, schema });
  } else {
    // SQLite with better-sqlite3
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");

    const sqlite = new Database(process.env.DATABASE_URL ?? "quiz.db");
    // Enable WAL mode for better performance
    sqlite.pragma("journal_mode = WAL");

    return drizzle({ client: sqlite, schema });
  }
}

export const db = createDatabase();

// Export dialect for use in other parts of the app
export const dialect = dbDialect as "sqlite" | "postgres";
