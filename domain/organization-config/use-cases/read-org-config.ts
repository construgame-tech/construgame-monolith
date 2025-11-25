// Use Case: Ler a configuração de uma organização

import { OrgConfigEntity } from "../entities/org-config.entity";
import { IOrgConfigRepository } from "../repositories/org-config.repository.interface";

export interface ReadOrgConfigInput {
  organizationId: string;
}

export interface ReadOrgConfigOutput {
  config: OrgConfigEntity | null;
}

export const readOrgConfig = async (
  input: ReadOrgConfigInput,
  repository: IOrgConfigRepository,
): Promise<ReadOrgConfigOutput> => {
  const config = await repository.findByOrganizationId(input.organizationId);

  return { config };
};
