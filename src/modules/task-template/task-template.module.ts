import { DatabaseModule } from "@infrastructure/database/database.module";
import { TaskTemplateRepository } from "@infrastructure/repositories/task-template.repository";
import { Module } from "@nestjs/common";
import { TaskTemplateController } from "./task-template.controller";
import { TaskTemplateService } from "./task-template.service";

@Module({
  imports: [DatabaseModule],
  controllers: [TaskTemplateController],
  providers: [
    TaskTemplateService,
    {
      provide: "TaskTemplateRepository",
      useClass: TaskTemplateRepository,
    },
  ],
  exports: [TaskTemplateService],
})
export class TaskTemplateModule {}
