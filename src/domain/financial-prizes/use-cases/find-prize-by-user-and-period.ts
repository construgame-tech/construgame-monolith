// Use Case: Buscar prêmio financeiro por usuário e período
import type { FinancialPrizeEntity } from "../entities/financial-prize.entity";
import type { IFinancialPrizeRepository } from "../repositories/financial-prize.repository.interface";

export interface FindPrizeByUserAndPeriodInput {
  userId: string;
  gameId: string;
  period: string;
}

export interface FindPrizeByUserAndPeriodOutput {
  prize: FinancialPrizeEntity | null;
}

export const findPrizeByUserAndPeriod = async (
  input: FindPrizeByUserAndPeriodInput,
  repository: IFinancialPrizeRepository,
): Promise<FindPrizeByUserAndPeriodOutput> => {
  const prize = await repository.findByUserAndPeriod(
    input.userId,
    input.gameId,
    input.period,
  );

  return { prize };
};
