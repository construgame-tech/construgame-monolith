// Use Case: Criar a configuração de kaizen de uma organização

import {
  CategoryPoints,
  OrgKaizenConfigEntity,
  createOrgKaizenConfigEntity,
} from "../entities/org-kaizen-config.entity";
import { IOrgKaizenConfigRepository } from "../repositories/org-kaizen-config.repository.interface";

export interface CreateOrgKaizenConfigInput {
  organizationId: string;
  categoryPoints: {
    "1": CategoryPoints;
    "2"?: CategoryPoints;
    "3"?: CategoryPoints;
    "4"?: CategoryPoints;
    "5"?: CategoryPoints;
  };
}

export interface CreateOrgKaizenConfigOutput {
  config: OrgKaizenConfigEntity;
}

export const createOrgKaizenConfig = async (
  input: CreateOrgKaizenConfigInput,
  repository: IOrgKaizenConfigRepository,
): Promise<CreateOrgKaizenConfigOutput> => {
  const config = createOrgKaizenConfigEntity({
    organizationId: input.organizationId,
    categoryPoints: input.categoryPoints,
  });

  await repository.save(config);

  return { config };
};
