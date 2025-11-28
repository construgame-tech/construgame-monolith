// Use Case: Criar um novo Kaizen Type
import { randomUUID } from "node:crypto";
import { createKaizenTypeEntity, KaizenTypeEntity } from "../entities/kaizen-type.entity";
import type { IKaizenTypeRepository } from "../repositories/kaizen-type.repository.interface";

export interface CreateKaizenTypeInput {
  organizationId: string;
  name: string;
  description?: string;
  points: number;
  ideaPoints?: number;
  ideaExecutionPoints?: number;
}

export interface CreateKaizenTypeOutput {
  type: KaizenTypeEntity;
}

export const createKaizenType = async (
  input: CreateKaizenTypeInput,
  repository: IKaizenTypeRepository,
): Promise<CreateKaizenTypeOutput> => {
  const type = createKaizenTypeEntity({
    id: randomUUID(),
    organizationId: input.organizationId,
    name: input.name,
    description: input.description,
    points: input.points,
    ideaPoints: input.ideaPoints,
    ideaExecutionPoints: input.ideaExecutionPoints,
  });

  await repository.save(type);

  return { type };
};
