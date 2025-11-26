// Use Case: Deletar um sector

import { ISectorRepository } from "../repositories/sector.repository.interface";

export interface DeleteSectorInput {
  organizationId: string;
  sectorId: string;
}

export interface DeleteSectorOutput {
  success: boolean;
}

export const deleteSector = async (
  input: DeleteSectorInput,
  repository: ISectorRepository,
): Promise<DeleteSectorOutput> => {
  // Verifica se o sector existe
  const sector = await repository.findById(
    input.organizationId,
    input.sectorId,
  );

  if (!sector) {
    throw new Error("Sector not found");
  }

  // Remove do repositório
  await repository.delete(input.organizationId, input.sectorId);

  return { success: true };
};
