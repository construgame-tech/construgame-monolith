import { FinancialPrizeEntity } from "../entities/financial-prize.entity";

export interface IFinancialPrizeRepository {
  save(prize: FinancialPrizeEntity): Promise<void>;
  findByUserAndPeriod(
    userId: string,
    gameId: string,
    period: string,
  ): Promise<FinancialPrizeEntity | null>;
  findByGameAndPeriod(
    gameId: string,
    period: string,
  ): Promise<FinancialPrizeEntity[]>;
  findByUser(userId: string): Promise<FinancialPrizeEntity[]>;
}
