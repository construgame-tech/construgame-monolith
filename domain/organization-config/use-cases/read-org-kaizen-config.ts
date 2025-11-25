// Use Case: Ler a configuração de kaizen de uma organização

import { OrgKaizenConfigEntity } from "../entities/org-kaizen-config.entity";
import { IOrgKaizenConfigRepository } from "../repositories/org-kaizen-config.repository.interface";

export interface ReadOrgKaizenConfigInput {
  organizationId: string;
}

export interface ReadOrgKaizenConfigOutput {
  config: OrgKaizenConfigEntity | null;
}

export const readOrgKaizenConfig = async (
  input: ReadOrgKaizenConfigInput,
  repository: IOrgKaizenConfigRepository,
): Promise<ReadOrgKaizenConfigOutput> => {
  const config = await repository.findByOrganizationId(input.organizationId);

  return { config };
};
