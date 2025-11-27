import { DatabaseModule } from "@infrastructure/database/database.module";
import { LeagueRepository } from "@infrastructure/repositories/league.repository";
import { Module } from "@nestjs/common";
import { LeagueController } from "./league.controller";
import { LeagueService } from "./league.service";
import {
  LeagueRankingController,
  LeagueReportsController,
} from "./league-ranking.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [
    LeagueController,
    LeagueRankingController,
    LeagueReportsController,
  ],
  providers: [
    LeagueService,
    {
      provide: "ILeagueRepository",
      useClass: LeagueRepository,
    },
  ],
  exports: [LeagueService],
})
export class LeagueModule {}
