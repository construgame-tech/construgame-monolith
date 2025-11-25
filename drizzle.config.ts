import type { Config } from "drizzle-kit";

export default {
  schema: "./src/infrastructure/database/schemas/*.schema.ts",
  out: "./src/infrastructure/database/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://construgame:construgame_dev_password@localhost:5432/construgame",
  },
} satisfies Config;
