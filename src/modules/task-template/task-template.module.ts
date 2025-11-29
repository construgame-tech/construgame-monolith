import { DatabaseModule } from "@infrastructure/database/database.module";
import { ChecklistTemplateRepository } from "@infrastructure/repositories/checklist-template.repository";
import { TaskTemplateRepository } from "@infrastructure/repositories/task-template.repository";
import { Module } from "@nestjs/common";
import { ChecklistTemplateService } from "./checklist-template.service";
import {
  ChecklistTemplateController,
  TaskTemplateController,
} from "./task-template.controller";
import { TaskTemplateService } from "./task-template.service";

@Module({
  imports: [DatabaseModule],
  controllers: [TaskTemplateController, ChecklistTemplateController],
  providers: [
    TaskTemplateService,
    ChecklistTemplateService,
    ChecklistTemplateRepository,
    {
      provide: "TaskTemplateRepository",
      useClass: TaskTemplateRepository,
    },
  ],
  exports: [
    TaskTemplateService,
    ChecklistTemplateService,
    ChecklistTemplateRepository,
  ],
})
export class TaskTemplateModule {}
