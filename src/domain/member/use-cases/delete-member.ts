// Use Case: Deletar um member

import { IMemberRepository } from "../repositories/member.repository.interface";

export interface DeleteMemberInput {
  userId: string;
  organizationId: string;
}

export interface DeleteMemberOutput {
  success: boolean;
}

export const deleteMember = async (
  input: DeleteMemberInput,
  memberRepository: IMemberRepository,
): Promise<DeleteMemberOutput> => {
  // Verifica se o member existe
  const member = await memberRepository.findByUserAndOrganization(
    input.userId,
    input.organizationId,
  );

  if (!member) {
    throw new Error(
      `Member not found: ${input.userId} in organization ${input.organizationId}`,
    );
  }

  // Deleta do repositório
  await memberRepository.delete(input.userId, input.organizationId);

  return { success: true };
};
