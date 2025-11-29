import { DatabaseModule } from "@infrastructure/database/database.module";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import { ProjectPlanningRepository } from "@infrastructure/repositories/project-planning.repository";
import { TaskRepository } from "@infrastructure/repositories/task.repository";
import { TaskManagerRepository } from "@infrastructure/repositories/task-manager.repository";
import { Module } from "@nestjs/common";
import { TaskManagerController } from "./task-manager.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [TaskManagerController],
  providers: [
    TaskManagerRepository,
    GameRepository,
    TaskRepository,
    ProjectPlanningRepository,
  ],
  exports: [TaskManagerRepository],
})
export class TaskManagerModule {}
