// Interface do repositório de OrganizationConfig
// Define o contrato para persistência, sem implementação

import { OrgConfigEntity } from "../entities/org-config.entity";

export interface IOrgConfigRepository {
  // Persiste uma configuração (create ou update)
  save(config: OrgConfigEntity): Promise<void>;

  // Busca a configuração de uma organização
  findByOrganizationId(organizationId: string): Promise<OrgConfigEntity | null>;
}
