// Database Module para NestJS
// Módulo responsável por configurar e fornecer a conexão Drizzle ORM

import { Global, Module } from "@nestjs/common";
import { DRIZZLE_CONNECTION, drizzleProvider } from "./drizzle.provider";

export type { DrizzleDB } from "./drizzle.provider";
@Global()
@Module({
  providers: [drizzleProvider],
  exports: [DRIZZLE_CONNECTION],
})
export class DatabaseModule {}
