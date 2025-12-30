// This file is a barrel export that gets resolved at build time by webpack.
// During development, it defaults to SQLite schema.
// At build time, next.config.ts resolves this to the correct schema based on DB_DIALECT.
//
// Note: This file exists for IDE support and as a fallback.
// The webpack alias in next.config.ts overrides this resolution at build time.

export * from "./schema.sqlite";
