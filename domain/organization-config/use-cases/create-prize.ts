// Use Case: Criar um novo prize

import { randomUUID } from "node:crypto";
import { createPrizeEntity, PrizeEntity } from "../entities/prize.entity";
import { IPrizeRepository } from "../repositories/prize.repository.interface";

export interface CreatePrizeInput {
  organizationId: string;
  name: string;
  description?: string;
  icon?: string;
  photo?: string;
}

export interface CreatePrizeOutput {
  prize: PrizeEntity;
}

export const createPrize = async (
  input: CreatePrizeInput,
  repository: IPrizeRepository,
): Promise<CreatePrizeOutput> => {
  // Gera um ID único para o novo prize
  const prizeId = randomUUID();

  // Cria a entidade de domínio
  const prize = createPrizeEntity({
    id: prizeId,
    organizationId: input.organizationId,
    name: input.name,
    description: input.description,
    icon: input.icon,
    photo: input.photo,
  });

  // Persiste no repositório
  await repository.save(prize);

  return { prize };
};
