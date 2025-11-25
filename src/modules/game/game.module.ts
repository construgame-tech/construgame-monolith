// Game Module
// Módulo NestJS para gerenciamento de games
// Implementa padrão de arquitetura limpa usando domain use-cases

import { DatabaseModule } from "@infrastructure/database/database.module";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import { Module } from "@nestjs/common";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";

@Module({
  imports: [DatabaseModule],
  controllers: [GameController],
  providers: [GameService, GameRepository],
  exports: [GameService, GameRepository],
})
export class GameModule {}
