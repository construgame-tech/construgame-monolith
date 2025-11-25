import { DatabaseModule } from "@infrastructure/database/database.module";
import { FinancialPrizeRepository } from "@infrastructure/repositories/financial-prize.repository";
import { Module } from "@nestjs/common";
import { FinancialPrizeController } from "./financial-prize.controller";
import { FinancialPrizeService } from "./financial-prize.service";

@Module({
  imports: [DatabaseModule],
  controllers: [FinancialPrizeController],
  providers: [
    FinancialPrizeService,
    {
      provide: "IFinancialPrizeRepository",
      useClass: FinancialPrizeRepository,
    },
  ],
  exports: [FinancialPrizeService],
})
export class FinancialPrizeModule {}
