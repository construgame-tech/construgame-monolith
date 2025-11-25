import { DatabaseModule } from "@infrastructure/database/database.module";
import { TeamRepository } from "@infrastructure/repositories/team.repository";
import { Module } from "@nestjs/common";
import { TeamController } from "./team.controller";
import { TeamService } from "./team.service";

@Module({
  imports: [DatabaseModule],
  controllers: [TeamController],
  providers: [
    TeamService,
    {
      provide: "ITeamRepository",
      useClass: TeamRepository,
    },
  ],
  exports: [TeamService],
})
export class TeamModule {}
