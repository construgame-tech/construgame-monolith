// Drizzle Provider para NestJS
// Configura a conexão com o banco de dados PostgreSQL usando Drizzle ORM

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas";

export const DRIZZLE_CONNECTION = "DRIZZLE_CONNECTION";

export const drizzleProvider = {
  provide: DRIZZLE_CONNECTION,
  useFactory: async () => {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://construgame:construgame_dev_password@localhost:5432/construgame";

    const pool = new Pool({
      connectionString,
      max: 10, // Número máximo de conexões no pool
      idleTimeoutMillis: 30000, // Tempo de espera antes de fechar conexões ociosas
      connectionTimeoutMillis: 2000, // Tempo máximo para estabelecer conexão
    });

    // Testa a conexão
    try {
      const client = await pool.connect();
      console.log("✅ Database connection established successfully");
      client.release();
    } catch (error) {
      console.error("❌ Failed to connect to database:", error);
      throw error;
    }

    return drizzle(pool, { schema });
  },
};

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;
