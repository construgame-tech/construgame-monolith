import { DatabaseModule } from "@infrastructure/database/database.module";
import { KaizenRepository } from "@infrastructure/repositories/kaizen.repository";
import { Module } from "@nestjs/common";
import { KaizenController } from "./kaizen.controller";
import { KaizenService } from "./kaizen.service";

@Module({
  imports: [DatabaseModule],
  controllers: [KaizenController],
  providers: [
    KaizenService,
    {
      provide: "IKaizenRepository",
      useClass: KaizenRepository,
    },
  ],
  exports: [KaizenService],
})
export class KaizenModule {}
