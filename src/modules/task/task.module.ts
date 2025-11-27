import { DatabaseModule } from "@infrastructure/database/database.module";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import { TaskRepository } from "@infrastructure/repositories/task.repository";
import { Module } from "@nestjs/common";
import { TaskController } from "./task.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [TaskController],
  providers: [TaskRepository, GameRepository],
  exports: [TaskRepository],
})
export class TaskModule {}
