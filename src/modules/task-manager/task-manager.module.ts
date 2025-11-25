import { DatabaseModule } from "@infrastructure/database/database.module";
import { TaskManagerRepository } from "@infrastructure/repositories/task-manager.repository";
import { Module } from "@nestjs/common";
import { TaskManagerController } from "./task-manager.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [TaskManagerController],
  providers: [TaskManagerRepository],
  exports: [TaskManagerRepository],
})
export class TaskManagerModule {}
