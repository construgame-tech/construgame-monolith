// Use Case: Deletar um prize

import { IPrizeRepository } from "../repositories/prize.repository.interface";

export interface DeletePrizeInput {
  organizationId: string;
  prizeId: string;
}

export interface DeletePrizeOutput {
  success: boolean;
}

export const deletePrize = async (
  input: DeletePrizeInput,
  repository: IPrizeRepository,
): Promise<DeletePrizeOutput> => {
  // Verifica se o prize existe
  const prize = await repository.findById(input.organizationId, input.prizeId);

  if (!prize) {
    throw new Error("Prize not found");
  }

  // Remove do repositório
  await repository.delete(input.organizationId, input.prizeId);

  return { success: true };
};
