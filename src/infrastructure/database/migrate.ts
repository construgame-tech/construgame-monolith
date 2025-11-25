// Migration script para Drizzle ORM
// Executa as migrações do banco de dados

import * as path from "node:path";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// Carrega variáveis de ambiente
dotenv.config();

async function runMigrations() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://construgame:construgame_dev_password@localhost:5432/construgame";

  console.log("🔄 Starting database migrations...");
  console.log(`📍 Database: ${connectionString.split("@")[1]}`);

  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool);

  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "migrations"),
    });

    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executa as migrações
runMigrations()
  .then(() => {
    console.log("🎉 Database is up to date!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error during migration:", error);
    process.exit(1);
  });
