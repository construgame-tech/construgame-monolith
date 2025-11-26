// Use Case: Atualizar a configuração de uma organização

import {
  OrgConfigEntity,
  updateOrgConfigEntity,
} from "../entities/org-config.entity";
import { IOrgConfigRepository } from "../repositories/org-config.repository.interface";

export interface UpdateOrgConfigInput {
  organizationId: string;
  missionsEnabled?: boolean;
  financialEnabled?: boolean;
  kaizensEnabled?: boolean;
  projectDiaryEnabled?: boolean;
  missionConfig?: {
    autoApproveUpdates: boolean;
  };
  theme?: {
    menu: {
      background: string;
      color: string;
    };
  };
  auth?: {
    login: {
      email: boolean;
      microsoftSSO: boolean;
    };
  };
}

export interface UpdateOrgConfigOutput {
  config: OrgConfigEntity;
}

export const updateOrgConfig = async (
  input: UpdateOrgConfigInput,
  repository: IOrgConfigRepository,
): Promise<UpdateOrgConfigOutput> => {
  // Busca a configuração atual
  const currentConfig = await repository.findByOrganizationId(
    input.organizationId,
  );

  if (!currentConfig) {
    throw new Error("Organization config not found");
  }

  // Atualiza a entidade
  const updatedConfig = updateOrgConfigEntity(currentConfig, {
    missionsEnabled: input.missionsEnabled,
    financialEnabled: input.financialEnabled,
    kaizensEnabled: input.kaizensEnabled,
    projectDiaryEnabled: input.projectDiaryEnabled,
    missionConfig: input.missionConfig,
    theme: input.theme,
    auth: input.auth,
  });

  // Persiste no repositório
  await repository.save(updatedConfig);

  return { config: updatedConfig };
};
