// Use Case: Listar todas as organizações de um usuário

import { MemberEntity } from "../entities/member.entity";
import { IMemberRepository } from "../repositories/member.repository.interface";

export interface ListUserOrganizationsInput {
  userId: string;
}

export interface ListUserOrganizationsOutput {
  members: MemberEntity[];
}

export const listUserOrganizations = async (
  input: ListUserOrganizationsInput,
  memberRepository: IMemberRepository,
): Promise<ListUserOrganizationsOutput> => {
  // Busca todas as organizações do usuário (via members)
  const members = await memberRepository.findByUserId(input.userId);

  return { members };
};
