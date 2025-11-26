// Entidade de domínio: OrganizationConfig
// Representa as configurações gerais de uma organização

export interface OrgConfigEntity {
  organizationId: string;
  missionsEnabled: boolean;
  financialEnabled: boolean;
  kaizensEnabled: boolean;
  projectDiaryEnabled?: boolean;
  missionConfig?: {
    autoApproveUpdates: boolean;
  };
  theme: {
    menu: {
      background: string;
      color: string;
    };
  };
  auth: {
    login: {
      email: boolean;
      microsoftSSO: boolean;
    };
  };
  sequence: number;
}

// Factory function para criar uma config inicial
export const createOrgConfigEntity = (props: {
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
}): OrgConfigEntity => {
  return {
    organizationId: props.organizationId,
    missionsEnabled: props.missionsEnabled ?? true,
    financialEnabled: props.financialEnabled ?? false,
    kaizensEnabled: props.kaizensEnabled ?? false,
    projectDiaryEnabled: props.projectDiaryEnabled ?? false,
    missionConfig: props.missionConfig ?? {
      autoApproveUpdates: false,
    },
    theme: props.theme ?? {
      menu: {
        background: "#1976d2",
        color: "#ffffff",
      },
    },
    auth: props.auth ?? {
      login: {
        email: true,
        microsoftSSO: false,
      },
    },
    sequence: 0,
  };
};

// Factory function para atualizar uma config existente
export const updateOrgConfigEntity = (
  current: OrgConfigEntity,
  updates: {
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
  },
): OrgConfigEntity => {
  return {
    ...current,
    missionsEnabled: updates.missionsEnabled ?? current.missionsEnabled,
    financialEnabled: updates.financialEnabled ?? current.financialEnabled,
    kaizensEnabled: updates.kaizensEnabled ?? current.kaizensEnabled,
    projectDiaryEnabled:
      updates.projectDiaryEnabled ?? current.projectDiaryEnabled,
    missionConfig: updates.missionConfig ?? current.missionConfig,
    theme: updates.theme ?? current.theme,
    auth: updates.auth ?? current.auth,
    sequence: current.sequence + 1,
  };
};
