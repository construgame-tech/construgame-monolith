// Entidade de domínio: JobRole
// Representa um cargo/função com suas variantes (seniority, estado, etc)

export interface JobRoleVariant {
  id: string;
  salary?: number;
  seniority?: string;
  state?: string;
  hoursPerDay?: number;
}

export interface JobRoleEntity {
  id: string;
  organizationId: string;
  name: string;
  variants: JobRoleVariant[];
  updatedBy?: string;
  updatedAt?: string;
  createdAt?: string;
  createdBy?: string;
}

// Factory function para criar um novo job role com valores padrão
export const createJobRoleEntity = (props: {
  id: string;
  organizationId: string;
  name: string;
  variants: JobRoleVariant[];
  createdBy?: string;
  createdAt?: string;
}): JobRoleEntity => {
  return {
    id: props.id,
    organizationId: props.organizationId,
    name: props.name,
    variants: props.variants,
    createdBy: props.createdBy,
    createdAt: props.createdAt || new Date().toISOString(),
  };
};

// Factory function para atualizar um job role existente
export const updateJobRoleEntity = (
  currentJobRole: JobRoleEntity,
  updates: {
    name?: string;
    variants?: JobRoleVariant[];
    updatedBy?: string;
  },
): JobRoleEntity => {
  return {
    ...currentJobRole,
    name: updates.name ?? currentJobRole.name,
    variants: updates.variants ?? currentJobRole.variants,
    updatedBy: updates.updatedBy,
    updatedAt: new Date().toISOString(),
  };
};
