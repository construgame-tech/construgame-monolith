// Use Case: Listar todos os sectors de uma organização

import { SectorEntity } from "../entities/sector.entity";
import { ISectorRepository } from "../repositories/sector.repository.interface";

export interface ListSectorsInput {
  organizationId: string;
}

export interface ListSectorsOutput {
  sectors: SectorEntity[];
}

export const listSectors = async (
  input: ListSectorsInput,
  repository: ISectorRepository,
): Promise<ListSectorsOutput> => {
  const sectors = await repository.findByOrganizationId(input.organizationId);

  return { sectors };
};
