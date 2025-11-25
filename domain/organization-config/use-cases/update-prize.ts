// Use Case: Atualizar um prize existente

import { PrizeEntity, updatePrizeEntity } from "../entities/prize.entity";
import { IPrizeRepository } from "../repositories/prize.repository.interface";

export interface UpdatePrizeInput {
  organizationId: string;
  prizeId: string;
  name?: string;
  description?: string;
  icon?: string;
  photo?: string;
}

export interface UpdatePrizeOutput {
  prize: PrizeEntity;
}

export const updatePrize = async (
  input: UpdatePrizeInput,
  repository: IPrizeRepository,
): Promise<UpdatePrizeOutput> => {
  // Busca o prize atual
  const currentPrize = await repository.findById(
    input.organizationId,
    input.prizeId,
  );

  if (!currentPrize) {
    throw new Error("Prize not found");
  }

  // Atualiza a entidade
  const updatedPrize = updatePrizeEntity(currentPrize, {
    name: input.name,
    description: input.description,
    icon: input.icon,
    photo: input.photo,
  });

  // Persiste no repositório
  await repository.save(updatedPrize);

  return { prize: updatedPrize };
};
