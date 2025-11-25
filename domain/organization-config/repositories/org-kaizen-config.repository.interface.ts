// Interface do repositório de OrganizationKaizenConfig
// Define o contrato para persistência, sem implementação

import { OrgKaizenConfigEntity } from "../entities/org-kaizen-config.entity";

export interface IOrgKaizenConfigRepository {
  // Persiste uma configuração de kaizen (create ou update)
  save(config: OrgKaizenConfigEntity): Promise<void>;

  // Busca a configuração de kaizen de uma organização
  findByOrganizationId(
    organizationId: string,
  ): Promise<OrgKaizenConfigEntity | null>;
}
