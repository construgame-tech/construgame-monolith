import { DatabaseModule } from "@infrastructure/database/database.module";
import { KaizenTypeRepository } from "@infrastructure/repositories/kaizen-type.repository";
import { Module } from "@nestjs/common";
import { KaizenTypeController } from "./kaizen-type.controller";
import { KaizenTypeService } from "./kaizen-type.service";

@Module({
  imports: [DatabaseModule],
  controllers: [KaizenTypeController],
  providers: [
    KaizenTypeService,
    {
      provide: "IKaizenTypeRepository",
      useClass: KaizenTypeRepository,
    },
  ],
  exports: [KaizenTypeService],
})
export class KaizenTypeModule {}
