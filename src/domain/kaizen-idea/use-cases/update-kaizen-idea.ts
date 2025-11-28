// Use Case: Atualizar uma kaizen idea existente
import {
  KaizenIdeaEntity,
  KaizenIdeaStatus,
  KaizenIdeaAuthors,
  KaizenIdeaProblem,
  KaizenIdeaSolution,
  KaizenIdeaTask,
  KaizenIdeaBenefit,
  KaizenIdeaAttachment,
  KaizenIdeaNonExecutableProject,
  updateKaizenIdeaEntity,
} from "../entities/kaizen-idea.entity";
import type { IKaizenIdeaRepository } from "../repositories/kaizen-idea.repository.interface";

export interface UpdateKaizenIdeaInput {
  organizationId: string;
  ideaId: string;
  projectId?: string;
  gameId?: string;
  kaizenTypeId?: string;
  status?: KaizenIdeaStatus;
  name?: string;
  isRecommended?: boolean;
  authors?: KaizenIdeaAuthors;
  problem?: KaizenIdeaProblem;
  solution?: KaizenIdeaSolution;
  tasks?: KaizenIdeaTask[];
  benefits?: KaizenIdeaBenefit[];
  attachments?: KaizenIdeaAttachment[];
  executableKaizenProjectIds?: string[];
  nonExecutableProjects?: KaizenIdeaNonExecutableProject[];
}

export interface UpdateKaizenIdeaOutput {
  idea: KaizenIdeaEntity;
}

export const updateKaizenIdea = async (
  input: UpdateKaizenIdeaInput,
  repository: IKaizenIdeaRepository,
): Promise<UpdateKaizenIdeaOutput> => {
  const currentIdea = await repository.findById(
    input.organizationId,
    input.ideaId,
  );

  if (!currentIdea) {
    throw new Error(`Kaizen idea not found: ${input.ideaId}`);
  }

  const updatedIdea = updateKaizenIdeaEntity(currentIdea, {
    projectId: input.projectId,
    gameId: input.gameId,
    kaizenTypeId: input.kaizenTypeId,
    status: input.status,
    name: input.name,
    isRecommended: input.isRecommended,
    authors: input.authors,
    problem: input.problem,
    solution: input.solution,
    tasks: input.tasks,
    benefits: input.benefits,
    attachments: input.attachments,
    executableKaizenProjectIds: input.executableKaizenProjectIds,
    nonExecutableProjects: input.nonExecutableProjects,
  });

  await repository.save(updatedIdea);

  return { idea: updatedIdea };
};
