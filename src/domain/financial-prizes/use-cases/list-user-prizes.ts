// Use Case: Listar prêmios financeiros de um usuário
import type { FinancialPrizeEntity } from "../entities/financial-prize.entity";
import type { IFinancialPrizeRepository } from "../repositories/financial-prize.repository.interface";

export interface ListUserPrizesInput {
  userId: string;
}

export interface ListUserPrizesOutput {
  prizes: FinancialPrizeEntity[];
}

export const listUserPrizes = async (
  input: ListUserPrizesInput,
  repository: IFinancialPrizeRepository,
): Promise<ListUserPrizesOutput> => {
  const prizes = await repository.findByUser(input.userId);

  return { prizes };
};
