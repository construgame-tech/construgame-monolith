import { DatabaseModule } from "@infrastructure/database/database.module";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import {
  GameKaizenPointsRepository,
  TeamGamePointsRepository,
  UserGamePointsRepository,
} from "@infrastructure/repositories/game-points.repository";
import { KaizenRepository } from "@infrastructure/repositories/kaizen.repository";
import { KaizenCommentRepository } from "@infrastructure/repositories/kaizen-comment.repository";
import { KaizenIdeaRepository } from "@infrastructure/repositories/kaizen-idea.repository";
import { KaizenTypeRepository } from "@infrastructure/repositories/kaizen-type.repository";
import { Module } from "@nestjs/common";
import { GameModule } from "../game/game.module";
import { KaizenController } from "./kaizen.controller";
import { KaizenService } from "./kaizen.service";

@Module({
  imports: [DatabaseModule, GameModule],
  controllers: [KaizenController],
  providers: [
    KaizenService,
    {
      provide: "IKaizenRepository",
      useClass: KaizenRepository,
    },
    {
      provide: "IKaizenCommentRepository",
      useClass: KaizenCommentRepository,
    },
    {
      provide: "IKaizenTypeRepository",
      useClass: KaizenTypeRepository,
    },
    {
      provide: "IKaizenIdeaRepository",
      useClass: KaizenIdeaRepository,
    },
    {
      provide: "UserGamePointsRepository",
      useClass: UserGamePointsRepository,
    },
    {
      provide: "TeamGamePointsRepository",
      useClass: TeamGamePointsRepository,
    },
    {
      provide: "GameKaizenPointsRepository",
      useClass: GameKaizenPointsRepository,
    },
    {
      provide: "IGameRepository",
      useClass: GameRepository,
    },
  ],
  exports: [KaizenService],
})
export class KaizenModule {}
