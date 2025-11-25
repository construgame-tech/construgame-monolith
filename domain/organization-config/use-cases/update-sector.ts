// Use Case: Atualizar um sector existente

import { SectorEntity, updateSectorEntity } from "../entities/sector.entity";
import { ISectorRepository } from "../repositories/sector.repository.interface";

export interface UpdateSectorInput {
  organizationId: string;
  sectorId: string;
  name?: string;
}

export interface UpdateSectorOutput {
  sector: SectorEntity;
}

export const updateSector = async (
  input: UpdateSectorInput,
  repository: ISectorRepository,
): Promise<UpdateSectorOutput> => {
  // Busca o sector atual
  const currentSector = await repository.findById(
    input.organizationId,
    input.sectorId,
  );

  if (!currentSector) {
    throw new Error("Sector not found");
  }

  // Atualiza a entidade
  const updatedSector = updateSectorEntity(currentSector, {
    name: input.name,
  });

  // Persiste no repositório
  await repository.save(updatedSector);

  return { sector: updatedSector };
};
