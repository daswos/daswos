import { defineConfig } from "drizzle-kit";

// Use Fly.io database URL or fall back to local development URL
const dbUrl = process.env.DATABASE_URL || "postgres://postgres:QqA7lBPZ67Z3gvP@daswos-db.flycast:5432";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  }
});



