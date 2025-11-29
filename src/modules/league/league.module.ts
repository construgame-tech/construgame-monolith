import { DatabaseModule } from "@infrastructure/database/database.module";
import { LeagueRepository } from "@infrastructure/repositories/league.repository";
import { Module } from "@nestjs/common";
import { LeagueController } from "./league.controller";
import { LeagueService } from "./league.service";
import {
  LeagueRankingController,
  LeagueReportsController,
} from "./league-ranking.controller";
import { LeagueReportsService } from "./league-reports.service";

@Module({
  imports: [DatabaseModule],
  controllers: [
    LeagueController,
    LeagueRankingController,
    LeagueReportsController,
  ],
  providers: [
    LeagueService,
    LeagueReportsService,
    {
      provide: "ILeagueRepository",
      useClass: LeagueRepository,
    },
  ],
  exports: [LeagueService, LeagueReportsService],
})
export class LeagueModule {}
