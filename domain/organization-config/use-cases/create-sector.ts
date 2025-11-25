// Use Case: Criar um novo sector

import { randomUUID } from "node:crypto";
import { createSectorEntity, SectorEntity } from "../entities/sector.entity";
import { ISectorRepository } from "../repositories/sector.repository.interface";

export interface CreateSectorInput {
  organizationId: string;
  name: string;
}

export interface CreateSectorOutput {
  sector: SectorEntity;
}

export const createSector = async (
  input: CreateSectorInput,
  repository: ISectorRepository,
): Promise<CreateSectorOutput> => {
  // Gera um ID único para o novo sector
  const sectorId = randomUUID();

  // Cria a entidade de domínio
  const sector = createSectorEntity({
    id: sectorId,
    organizationId: input.organizationId,
    name: input.name,
  });

  // Persiste no repositório
  await repository.save(sector);

  return { sector };
};
