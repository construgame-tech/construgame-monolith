import { DatabaseModule } from "@infrastructure/database/database.module";
import { ProjectRepository } from "@infrastructure/repositories/project.repository";
import { Module } from "@nestjs/common";
import { ProjectController } from "./project.controller";
import { ProjectService } from "./project.service";
import {
  ProjectRankingController,
  ProjectReportController,
} from "./project-ranking.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [
    ProjectController,
    ProjectRankingController,
    ProjectReportController,
  ],
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
