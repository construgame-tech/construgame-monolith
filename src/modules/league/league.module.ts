import { DatabaseModule } from "@infrastructure/database/database.module";
import { LeagueRepository } from "@infrastructure/repositories/league.repository";
import { Module } from "@nestjs/common";
import { LeagueController } from "./league.controller";
import { LeagueService } from "./league.service";

@Module({
  imports: [DatabaseModule],
  controllers: [LeagueController],
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
