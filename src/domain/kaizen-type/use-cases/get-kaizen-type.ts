// Use Case: Buscar um Kaizen Type por ID
import type { KaizenTypeEntity } from "../entities/kaizen-type.entity";
import type { IKaizenTypeRepository } from "../repositories/kaizen-type.repository.interface";

export interface GetKaizenTypeInput {
  organizationId: string;
  typeId: string;
}

export interface GetKaizenTypeOutput {
  type: KaizenTypeEntity;
}

export const getKaizenType = async (
  input: GetKaizenTypeInput,
  repository: IKaizenTypeRepository,
): Promise<GetKaizenTypeOutput> => {
  const type = await repository.findById(
    input.organizationId,
    input.typeId,
  );

  if (!type) {
    throw new Error(`Kaizen type not found: ${input.typeId}`);
  }

  return { type };
};
