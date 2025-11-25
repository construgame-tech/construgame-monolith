import { DatabaseModule } from "@infrastructure/database/database.module";
import { ProjectRepository } from "@infrastructure/repositories/project.repository";
import { Module } from "@nestjs/common";
import { ProjectController } from "./project.controller";
import { ProjectService } from "./project.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    {
      provide: "IProjectRepository",
      useClass: ProjectRepository,
    },
  ],
  exports: [ProjectService],
})
export class ProjectModule {}
