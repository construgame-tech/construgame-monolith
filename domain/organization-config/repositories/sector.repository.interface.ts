// Interface do repositório de Sector
// Define o contrato para persistência, sem implementação

import { SectorEntity } from "../entities/sector.entity";

export interface ISectorRepository {
  // Persiste um sector (create ou update)
  save(sector: SectorEntity): Promise<void>;

  // Remove um sector
  delete(organizationId: string, sectorId: string): Promise<void>;

  // Busca um sector por ID
  findById(
    organizationId: string,
    sectorId: string,
  ): Promise<SectorEntity | null>;

  // Lista todos os sectors de uma organização
  findByOrganizationId(organizationId: string): Promise<SectorEntity[]>;
}
