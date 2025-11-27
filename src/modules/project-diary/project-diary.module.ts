import { DatabaseModule } from "@infrastructure/database/database.module";
import { ProjectDiaryRepository } from "@infrastructure/repositories/project-diary.repository";
import { Module } from "@nestjs/common";
import { ProjectDiaryController } from "./project-diary.controller";
import { ProjectDiaryOrgController } from "./project-diary-org.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectDiaryController, ProjectDiaryOrgController],
  providers: [ProjectDiaryRepository],
  exports: [ProjectDiaryRepository],
})
export class ProjectDiaryModule {}
