// Use Case: Atualizar um Kaizen Type existente
import { KaizenTypeEntity, updateKaizenTypeEntity } from "../entities/kaizen-type.entity";
import type { IKaizenTypeRepository } from "../repositories/kaizen-type.repository.interface";

export interface UpdateKaizenTypeInput {
  organizationId: string;
  typeId: string;
  name?: string;
  description?: string;
  points?: number;
  ideaPoints?: number;
  ideaExecutionPoints?: number;
}

export interface UpdateKaizenTypeOutput {
  type: KaizenTypeEntity;
}

export const updateKaizenType = async (
  input: UpdateKaizenTypeInput,
  repository: IKaizenTypeRepository,
): Promise<UpdateKaizenTypeOutput> => {
  const currentType = await repository.findById(
    input.organizationId,
    input.typeId,
  );

  if (!currentType) {
    throw new Error(`Kaizen type not found: ${input.typeId}`);
  }

  const updatedType = updateKaizenTypeEntity(currentType, {
    name: input.name,
    description: input.description,
    points: input.points,
    ideaPoints: input.ideaPoints,
    ideaExecutionPoints: input.ideaExecutionPoints,
  });

  await repository.save(updatedType);

  return { type: updatedType };
};
