// Use Case: Buscar uma kaizen idea por ID
import type { KaizenIdeaEntity } from "../entities/kaizen-idea.entity";
import type { IKaizenIdeaRepository } from "../repositories/kaizen-idea.repository.interface";

export interface GetKaizenIdeaInput {
  organizationId: string;
  ideaId: string;
}

export interface GetKaizenIdeaOutput {
  idea: KaizenIdeaEntity;
}

export const getKaizenIdea = async (
  input: GetKaizenIdeaInput,
  repository: IKaizenIdeaRepository,
): Promise<GetKaizenIdeaOutput> => {
  const idea = await repository.findById(
    input.organizationId,
    input.ideaId,
  );

  if (!idea) {
    throw new Error(`Kaizen idea not found: ${input.ideaId}`);
  }

  return { idea };
};
