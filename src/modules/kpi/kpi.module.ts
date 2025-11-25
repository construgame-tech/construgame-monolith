import { DatabaseModule } from "@infrastructure/database/database.module";
import { KpiRepository } from "@infrastructure/repositories/kpi.repository";
import { Module } from "@nestjs/common";
import { KpiController } from "./kpi.controller";
import { KpiService } from "./kpi.service";

@Module({
  imports: [DatabaseModule],
  controllers: [KpiController],
  providers: [
    KpiService,
    {
      provide: "IKpiRepository",
      useClass: KpiRepository,
    },
  ],
  exports: [KpiService],
})
export class KpiModule {}
