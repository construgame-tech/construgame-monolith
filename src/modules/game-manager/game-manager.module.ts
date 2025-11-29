// Game Manager Module
// Módulo NestJS para gerenciamento de game managers

import { DatabaseModule } from "@infrastructure/database/database.module";
import { GameManagerRepository } from "@infrastructure/repositories/game-manager.repository";
import { GameManagerTaskRepository } from "@infrastructure/repositories/game-manager-task.repository";
import { Module } from "@nestjs/common";
import { GameManagerController } from "./game-manager.controller";
import { GameManagerService } from "./game-manager.service";

@Module({
  imports: [DatabaseModule],
  controllers: [GameManagerController],
  providers: [
    GameManagerService,
    GameManagerRepository,
    GameManagerTaskRepository,
  ],
  exports: [GameManagerService],
})
export class GameManagerModule {}
