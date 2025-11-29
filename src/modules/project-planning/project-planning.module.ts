import { DatabaseModule } from "@infrastructure/database/database.module";
import { ProjectPlanningRepository } from "@infrastructure/repositories/project-planning.repository";
import { TaskManagerRepository } from "@infrastructure/repositories/task-manager.repository";
import { Module } from "@nestjs/common";
import { ProjectPlanningController } from "./project-planning.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectPlanningController],
  providers: [ProjectPlanningRepository, TaskManagerRepository],
  exports: [ProjectPlanningRepository],
})
export class ProjectPlanningModule {}
