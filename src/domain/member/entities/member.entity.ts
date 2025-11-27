// Entidade de domínio: Member
// Representa a relação de um usuário com uma organização

export type MemberRole = "owner" | "admin" | "manager" | "player" | "financial";

export interface MemberEntity {
  userId: string;
  organizationId: string;
  role: MemberRole;
  sectorId?: string;
  sector?: string;
  position?: string;

  // Job role data - stored directly on member
  jobRoleId?: string;
  jobRoleVariantId?: string;
  salary?: number;
  seniority?: string;
  state?: string;
  hoursPerDay?: number;
}

// Factory function para criar um novo member com valores padrão
export const createMemberEntity = (props: {
  userId: string;
  organizationId: string;
  role: MemberRole;
  sectorId?: string;
  sector?: string;
  position?: string;
  jobRoleId?: string;
  jobRoleVariantId?: string;
  salary?: number;
  seniority?: string;
  state?: string;
  hoursPerDay?: number;
}): MemberEntity => {
  return {
    userId: props.userId,
    organizationId: props.organizationId,
    role: props.role,
    sectorId: props.sectorId,
    sector: props.sector,
    position: props.position,
    jobRoleId: props.jobRoleId,
    jobRoleVariantId: props.jobRoleVariantId,
    salary: props.salary,
    seniority: props.seniority,
    state: props.state,
    hoursPerDay: props.hoursPerDay,
  };
};

// Factory function para atualizar um member existente
export const updateMemberEntity = (
  currentMember: MemberEntity,
  updates: {
    role?: MemberRole;
    sectorId?: string;
    sector?: string;
    position?: string;
    jobRoleId?: string;
    jobRoleVariantId?: string;
    salary?: number;
    seniority?: string;
    state?: string;
    hoursPerDay?: number;
  },
): MemberEntity => {
  return {
    ...currentMember,
    role: updates.role ?? currentMember.role,
    sectorId: updates.sectorId ?? currentMember.sectorId,
    sector: updates.sector ?? currentMember.sector,
    position: updates.position ?? currentMember.position,
    jobRoleId: updates.jobRoleId ?? currentMember.jobRoleId,
    jobRoleVariantId:
      updates.jobRoleVariantId ?? currentMember.jobRoleVariantId,
    salary: updates.salary ?? currentMember.salary,
    seniority: updates.seniority ?? currentMember.seniority,
    state: updates.state ?? currentMember.state,
    hoursPerDay: updates.hoursPerDay ?? currentMember.hoursPerDay,
  };
};
