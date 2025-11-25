// Use Case: Criar um novo member

import {
  createMemberEntity,
  MemberEntity,
  MemberRole,
} from "../entities/member.entity";
import { IMemberRepository } from "../repositories/member.repository.interface";

export interface CreateMemberInput {
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
}

export interface CreateMemberOutput {
  member: MemberEntity;
}

export const createMember = async (
  input: CreateMemberInput,
  memberRepository: IMemberRepository,
): Promise<CreateMemberOutput> => {
  // Verifica se o member já existe
  const existingMember = await memberRepository.findByUserAndOrganization(
    input.userId,
    input.organizationId,
  );

  if (existingMember) {
    throw new Error(
      `Member already exists: ${input.userId} in organization ${input.organizationId}`,
    );
  }

  // Cria a entidade de domínio
  const member = createMemberEntity({
    userId: input.userId,
    organizationId: input.organizationId,
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
  await memberRepository.save(member);

  return { member };
};
