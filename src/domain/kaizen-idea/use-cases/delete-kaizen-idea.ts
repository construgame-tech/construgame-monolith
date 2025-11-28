// Use Case: Remover uma kaizen idea
import type { IKaizenIdeaRepository } from "../repositories/kaizen-idea.repository.interface";

export interface DeleteKaizenIdeaInput {
  organizationId: string;
  ideaId: string;
}

export const deleteKaizenIdea = async (
  input: DeleteKaizenIdeaInput,
  repository: IKaizenIdeaRepository,
): Promise<void> => {
  const idea = await repository.findById(
    input.organizationId,
    input.ideaId,
  );

  if (!idea) {
    throw new Error(`Kaizen idea not found: ${input.ideaId}`);
  }

  await repository.delete(input.organizationId, input.ideaId);
};
