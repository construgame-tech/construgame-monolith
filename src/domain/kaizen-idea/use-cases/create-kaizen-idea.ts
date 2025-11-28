// Use Case: Criar uma nova kaizen idea
import { randomUUID } from "node:crypto";
import {
  createKaizenIdeaEntity,
  KaizenIdeaEntity,
  KaizenIdeaAuthors,
  KaizenIdeaProblem,
  KaizenIdeaSolution,
  KaizenIdeaTask,
  KaizenIdeaBenefit,
  KaizenIdeaAttachment,
  KaizenIdeaNonExecutableProject,
} from "../entities/kaizen-idea.entity";
import type { IKaizenIdeaRepository } from "../repositories/kaizen-idea.repository.interface";

export interface CreateKaizenIdeaInput {
  organizationId: string;
  projectId?: string;
  gameId?: string;
  kaizenTypeId?: string;
  name: string;
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

export interface CreateKaizenIdeaOutput {
  idea: KaizenIdeaEntity;
}

export const createKaizenIdea = async (
  input: CreateKaizenIdeaInput,
  repository: IKaizenIdeaRepository,
): Promise<CreateKaizenIdeaOutput> => {
  const idea = createKaizenIdeaEntity({
    id: randomUUID(),
    organizationId: input.organizationId,
    projectId: input.projectId,
    gameId: input.gameId,
    kaizenTypeId: input.kaizenTypeId,
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

  await repository.save(idea);

  return { idea };
};
