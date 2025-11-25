// Use Case: Atualizar um member existente

import {
  MemberEntity,
  MemberRole,
  updateMemberEntity,
} from "../entities/member.entity";
import { IMemberRepository } from "../repositories/member.repository.interface";

export interface UpdateMemberInput {
  userId: string;
  organizationId: string;
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
}

export interface UpdateMemberOutput {
  member: MemberEntity;
}

export const updateMember = async (
  input: UpdateMemberInput,
  memberRepository: IMemberRepository,
): Promise<UpdateMemberOutput> => {
  // Busca o member atual
  const currentMember = await memberRepository.findByUserAndOrganization(
    input.userId,
    input.organizationId,
  );

  if (!currentMember) {
    throw new Error(
      `Member not found: ${input.userId} in organization ${input.organizationId}`,
    );
  }

  // Aplica as atualizações na entidade
  const updatedMember = updateMemberEntity(currentMember, {
    role: input.role,
    sectorId: input.sectorId,
    sector: input.sector,
    position: input.position,
    jobRoleId: input.jobRoleId,
    jobRoleVariantId: input.jobRoleVariantId,
    salary: input.salary,
    seniority: input.seniority,
    state: input.state,
    hoursPerDay: input.hoursPerDay,
  });

  // Persiste no repositório
  await memberRepository.save(updatedMember);

  return { member: updatedMember };
};
