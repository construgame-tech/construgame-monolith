// Use Case: Atualizar a configuração de kaizen de uma organização

import {
  CategoryPoints,
  OrgKaizenConfigEntity,
  updateOrgKaizenConfigEntity,
} from "../entities/org-kaizen-config.entity";
import { IOrgKaizenConfigRepository } from "../repositories/org-kaizen-config.repository.interface";

export interface UpdateOrgKaizenConfigInput {
  organizationId: string;
  categoryPoints?: {
    "1"?: CategoryPoints;
    "2"?: CategoryPoints;
    "3"?: CategoryPoints;
    "4"?: CategoryPoints;
    "5"?: CategoryPoints;
  };
}

export interface UpdateOrgKaizenConfigOutput {
  config: OrgKaizenConfigEntity;
}

export const updateOrgKaizenConfig = async (
  input: UpdateOrgKaizenConfigInput,
  repository: IOrgKaizenConfigRepository,
): Promise<UpdateOrgKaizenConfigOutput> => {
  // Busca a configuração atual
  const currentConfig = await repository.findByOrganizationId(
    input.organizationId,
  );

  if (!currentConfig) {
    throw new Error("Organization kaizen config not found");
  }

  // Atualiza a entidade
  const updatedConfig = updateOrgKaizenConfigEntity(currentConfig, {
    categoryPoints: input.categoryPoints,
  });

  // Persiste no repositório
  await repository.save(updatedConfig);

  return { config: updatedConfig };
};
