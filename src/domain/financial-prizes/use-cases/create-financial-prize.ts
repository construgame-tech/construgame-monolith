// Use Case: Criar um novo prêmio financeiro
import { randomUUID } from "node:crypto";
import { createFinancialPrizeEntity, FinancialPrizeEntity } from "../entities/financial-prize.entity";
import type { IFinancialPrizeRepository } from "../repositories/financial-prize.repository.interface";

export interface CreateFinancialPrizeInput {
  organizationId: string;
  projectId: string;
  gameId: string;
  userId: string;
  amount: number;
  period: string;
  details?: {
    laborCost?: number;
    kpiMultiplier?: number;
    taskPoints?: number;
    kaizenPoints?: number;
  };
}

export interface CreateFinancialPrizeOutput {
  prize: FinancialPrizeEntity;
}

export const createFinancialPrize = async (
  input: CreateFinancialPrizeInput,
  repository: IFinancialPrizeRepository,
): Promise<CreateFinancialPrizeOutput> => {
  const prize = createFinancialPrizeEntity({
    id: randomUUID(),
    organizationId: input.organizationId,
    projectId: input.projectId,
    gameId: input.gameId,
    userId: input.userId,
    amount: input.amount,
    period: input.period,
    details: input.details,
  });

  await repository.save(prize);

  return { prize };
};
