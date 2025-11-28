// Use Case: Remover um Kaizen Type
import type { IKaizenTypeRepository } from "../repositories/kaizen-type.repository.interface";

export interface DeleteKaizenTypeInput {
  organizationId: string;
  typeId: string;
}

export const deleteKaizenType = async (
  input: DeleteKaizenTypeInput,
  repository: IKaizenTypeRepository,
): Promise<void> => {
  const type = await repository.findById(
    input.organizationId,
    input.typeId,
  );

  if (!type) {
    throw new Error(`Kaizen type not found: ${input.typeId}`);
  }

  await repository.delete(input.organizationId, input.typeId);
};
