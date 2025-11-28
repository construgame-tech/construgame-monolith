// Use Case: Criar a configuração de uma organização

import {
  OrgConfigEntity,
  createOrgConfigEntity,
} from "../entities/org-config.entity";
import { IOrgConfigRepository } from "../repositories/org-config.repository.interface";

export interface CreateOrgConfigInput {
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

export interface CreateOrgConfigOutput {
  config: OrgConfigEntity;
}

export const createOrgConfig = async (
  input: CreateOrgConfigInput,
  repository: IOrgConfigRepository,
): Promise<CreateOrgConfigOutput> => {
  const config = createOrgConfigEntity({
    organizationId: input.organizationId,
    missionsEnabled: input.missionsEnabled,
    financialEnabled: input.financialEnabled,
    kaizensEnabled: input.kaizensEnabled,
    projectDiaryEnabled: input.projectDiaryEnabled,
    missionConfig: input.missionConfig,
    theme: input.theme,
    auth: input.auth,
  });

  await repository.save(config);

  return { config };
};
