// Use Case: Criar um novo kaizen

import { randomUUID } from "crypto";
import {
  createKaizenEntity,
  KaizenAttachment,
  KaizenBenefit,
  KaizenEntity,
  KaizenResponsibles,
  KaizenTask,
} from "../entities/kaizen.entity";
import { IKaizenRepository } from "../repositories/kaizen.repository.interface";

export interface CreateKaizenInput {
  organizationId: string;
  projectId: string;
  gameId: string;
  name: string;
  leaderId?: string;
  teamId?: string;
  category?: number;
  currentSituation?: string;
  currentSituationImages?: string[];
  solution?: string;
  solutionImages?: string[];
  tasks?: KaizenTask[];
  responsibles?: KaizenResponsibles;
  kaizenIdeaId?: string;
  kaizenTypeId?: string;
  benefits?: KaizenBenefit[];
  files?: string[];
  attachments?: KaizenAttachment[];
  resources?: string;
}

export interface CreateKaizenOutput {
  kaizen: KaizenEntity;
}

export const createKaizen = async (
  input: CreateKaizenInput,
  kaizenRepository: IKaizenRepository,
): Promise<CreateKaizenOutput> => {
  // Gera um ID único para o novo kaizen
  const kaizenId = randomUUID();

  // Cria a entidade de domínio
  const kaizen = createKaizenEntity({
    id: kaizenId,
    organizationId: input.organizationId,
    projectId: input.projectId,
    gameId: input.gameId,
    name: input.name,
    leaderId: input.leaderId,
    teamId: input.teamId,
    category: input.category,
    currentSituation: input.currentSituation,
    currentSituationImages: input.currentSituationImages,
    solution: input.solution,
    solutionImages: input.solutionImages,
    tasks: input.tasks,
    responsibles: input.responsibles,
    kaizenIdeaId: input.kaizenIdeaId,
    kaizenTypeId: input.kaizenTypeId,
    benefits: input.benefits,
    files: input.files,
    attachments: input.attachments,
    resources: input.resources,
  });

  // Persiste no repositório
  await kaizenRepository.save(kaizen);

  return { kaizen };
};
