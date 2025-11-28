// Use Case: Buscar prêmios financeiros por jogo e período
import type { FinancialPrizeEntity } from "../entities/financial-prize.entity";
import type { IFinancialPrizeRepository } from "../repositories/financial-prize.repository.interface";

export interface FindPrizesByGameAndPeriodInput {
  gameId: string;
  period: string;
}

export interface FindPrizesByGameAndPeriodOutput {
  prizes: FinancialPrizeEntity[];
}

export const findPrizesByGameAndPeriod = async (
  input: FindPrizesByGameAndPeriodInput,
  repository: IFinancialPrizeRepository,
): Promise<FindPrizesByGameAndPeriodOutput> => {
  const prizes = await repository.findByGameAndPeriod(
    input.gameId,
    input.period,
  );

  return { prizes };
};
