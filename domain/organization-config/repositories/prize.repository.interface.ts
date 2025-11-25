// Interface do repositório de Prize
// Define o contrato para persistência, sem implementação

import { PrizeEntity } from "../entities/prize.entity";

export interface IPrizeRepository {
  // Persiste um prize (create ou update)
  save(prize: PrizeEntity): Promise<void>;

  // Remove um prize
  delete(organizationId: string, prizeId: string): Promise<void>;

  // Busca um prize por ID
  findById(
    organizationId: string,
    prizeId: string,
  ): Promise<PrizeEntity | null>;

  // Lista todos os prizes de uma organização
  findByOrganizationId(organizationId: string): Promise<PrizeEntity[]>;
}
