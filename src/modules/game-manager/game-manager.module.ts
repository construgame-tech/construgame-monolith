// Game Manager Module
// Módulo NestJS para gerenciamento de game managers

import { Module } from "@nestjs/common";
import { GameManagerController } from "./game-manager.controller";

@Module({
  controllers: [GameManagerController],
  providers: [],
  exports: [],
})
export class GameManagerModule {}
