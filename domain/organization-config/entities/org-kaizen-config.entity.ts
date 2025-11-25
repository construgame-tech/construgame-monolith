// Entidade de domínio: OrganizationKaizenConfig
// Representa as configurações de pontos por categoria de kaizen

export interface CategoryPoints {
  points: number;
  description?: string;
}

export interface OrgKaizenConfigEntity {
  organizationId: string;
  categoryPoints: {
    "1": CategoryPoints;
    "2"?: CategoryPoints;
    "3"?: CategoryPoints;
    "4"?: CategoryPoints;
    "5"?: CategoryPoints;
  };
  sequence: number;
}

// Factory function para criar uma config inicial de kaizen
export const createOrgKaizenConfigEntity = (props: {
  organizationId: string;
  categoryPoints: {
    "1": CategoryPoints;
    "2"?: CategoryPoints;
    "3"?: CategoryPoints;
    "4"?: CategoryPoints;
    "5"?: CategoryPoints;
  };
}): OrgKaizenConfigEntity => {
  return {
    organizationId: props.organizationId,
    categoryPoints: props.categoryPoints,
    sequence: 0,
  };
};

// Factory function para atualizar uma config de kaizen existente
export const updateOrgKaizenConfigEntity = (
  current: OrgKaizenConfigEntity,
  updates: {
    categoryPoints?: {
      "1"?: CategoryPoints;
      "2"?: CategoryPoints;
      "3"?: CategoryPoints;
      "4"?: CategoryPoints;
      "5"?: CategoryPoints;
    };
  },
): OrgKaizenConfigEntity => {
  return {
    ...current,
    categoryPoints: {
      ...current.categoryPoints,
      ...updates.categoryPoints,
    },
    sequence: current.sequence + 1,
  };
};
