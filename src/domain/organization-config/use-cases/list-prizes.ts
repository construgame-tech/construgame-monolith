// Use Case: Listar todos os prizes de uma organização

import { PrizeEntity } from "../entities/prize.entity";
import { IPrizeRepository } from "../repositories/prize.repository.interface";

export interface ListPrizesInput {
  organizationId: string;
}

export interface ListPrizesOutput {
  prizes: PrizeEntity[];
}

export const listPrizes = async (
  input: ListPrizesInput,
  repository: IPrizeRepository,
): Promise<ListPrizesOutput> => {
  const prizes = await repository.findByOrganizationId(input.organizationId);

  return { prizes };
};
