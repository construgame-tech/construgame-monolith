import { DatabaseModule } from "@infrastructure/database/database.module";
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
  ],
  exports: [TaskUpdateService],
})
export class TaskUpdateModule {}
