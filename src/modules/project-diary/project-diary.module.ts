import { DatabaseModule } from "@infrastructure/database/database.module";
import { ProjectDiaryRepository } from "@infrastructure/repositories/project-diary.repository";
import { Module } from "@nestjs/common";
import { ProjectDiaryController } from "./project-diary.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectDiaryController],
  providers: [ProjectDiaryRepository],
  exports: [ProjectDiaryRepository],
})
export class ProjectDiaryModule {}
