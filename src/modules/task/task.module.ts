import { TaskRepository } from "@infrastructure/repositories/task.repository";
import { Module } from "@nestjs/common";
import { TaskController } from "./task.controller";

@Module({
  controllers: [TaskController],
  providers: [TaskRepository],
  exports: [TaskRepository],
})
export class TaskModule {}
