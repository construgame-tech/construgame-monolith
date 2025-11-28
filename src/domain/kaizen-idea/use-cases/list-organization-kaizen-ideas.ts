// Use Case: Listar kaizen ideas de uma organização
import type { KaizenIdeaEntity } from "../entities/kaizen-idea.entity";
import type { IKaizenIdeaRepository } from "../repositories/kaizen-idea.repository.interface";

export interface ListOrganizationKaizenIdeasInput {
  organizationId: string;
}

export interface ListOrganizationKaizenIdeasOutput {
  ideas: KaizenIdeaEntity[];
}

export const listOrganizationKaizenIdeas = async (
  input: ListOrganizationKaizenIdeasInput,
  repository: IKaizenIdeaRepository,
): Promise<ListOrganizationKaizenIdeasOutput> => {
  const ideas = await repository.findByOrganizationId(input.organizationId);

  return { ideas };
};
