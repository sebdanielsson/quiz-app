import { defineConfig } from "drizzle-kit";

const dbDialect = (process.env.DB_DIALECT ?? "sqlite") as "sqlite" | "postgresql";
const isPostgres = dbDialect === "postgresql" || process.env.DB_DIALECT === "postgres";

export default defineConfig({
  dialect: isPostgres ? "postgresql" : "sqlite",
  schema: isPostgres ? "./lib/db/schema.pg.ts" : "./lib/db/schema.sqlite.ts",
  out: isPostgres ? "./drizzle/pg" : "./drizzle/sqlite",
  dbCredentials: isPostgres
    ? { url: process.env.DATABASE_URL! }
    : { url: process.env.DATABASE_URL ?? "quiz.db" },
});
