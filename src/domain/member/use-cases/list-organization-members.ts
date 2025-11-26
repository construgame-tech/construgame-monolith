// Use Case: Listar todos os members de uma organização

import { MemberEntity } from "../entities/member.entity";
import { IMemberRepository } from "../repositories/member.repository.interface";

export interface ListOrganizationMembersInput {
  organizationId: string;
}

export interface ListOrganizationMembersOutput {
  members: MemberEntity[];
}

export const listOrganizationMembers = async (
  input: ListOrganizationMembersInput,
  memberRepository: IMemberRepository,
): Promise<ListOrganizationMembersOutput> => {
  // Busca todos os members da organização
  const members = await memberRepository.findByOrganizationId(
    input.organizationId,
  );

  return { members };
};
