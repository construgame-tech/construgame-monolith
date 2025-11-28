import { DatabaseModule } from "@infrastructure/database/database.module";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import {
  TeamGamePointsRepository,
  UserGamePointsRepository,
} from "@infrastructure/repositories/game-points.repository";
import { TaskRepository } from "@infrastructure/repositories/task.repository";
import { TaskUpdateRepository } from "@infrastructure/repositories/task-update.repository";
import { Module } from "@nestjs/common";
import { TaskUpdateController } from "./task-update.controller";
import { TaskUpdateService } from "./task-update.service";

@Module({
  imports: [DatabaseModule],
  controllers: [TaskUpdateController],
  providers: [
    TaskUpdateService,
    {
      provide: "TaskUpdateRepository",
      useClass: TaskUpdateRepository,
    },
    {
      provide: "ITaskRepository",
      useClass: TaskRepository,
    },
    {
      provide: "IGameRepository",
      useClass: GameRepository,
    },
    {
      provide: "UserGamePointsRepository",
      useClass: UserGamePointsRepository,
    },
    {
      provide: "TeamGamePointsRepository",
      useClass: TeamGamePointsRepository,
    },
  ],
  exports: [TaskUpdateService],
})
export class TaskUpdateModule {}
