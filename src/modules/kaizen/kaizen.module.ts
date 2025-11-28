import { DatabaseModule } from "@infrastructure/database/database.module";
import { KaizenRepository } from "@infrastructure/repositories/kaizen.repository";
import { KaizenCommentRepository } from "@infrastructure/repositories/kaizen-comment.repository";
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
  ],
  exports: [KaizenService],
})
export class KaizenModule {}
