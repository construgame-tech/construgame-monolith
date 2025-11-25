// Use Case: Buscar um member por userId e organizationId

import { MemberEntity } from "../entities/member.entity";
import { IMemberRepository } from "../repositories/member.repository.interface";

export interface GetMemberInput {
  userId: string;
  organizationId: string;
}

export interface GetMemberOutput {
  member: MemberEntity;
}

export const getMember = async (
  input: GetMemberInput,
  memberRepository: IMemberRepository,
): Promise<GetMemberOutput> => {
  // Busca o member
  const member = await memberRepository.findByUserAndOrganization(
    input.userId,
    input.organizationId,
  );

  if (!member) {
    throw new Error(
      `Member not found: ${input.userId} in organization ${input.organizationId}`,
    );
  }

  return { member };
};
