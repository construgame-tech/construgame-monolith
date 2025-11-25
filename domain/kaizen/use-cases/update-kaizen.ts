// Use Case: Atualizar um kaizen existente

import {
  KaizenAttachment,
  KaizenBenefit,
  KaizenEntity,
  KaizenResponsibles,
  KaizenStatus,
  KaizenTask,
  updateKaizenEntity,
  updateReplicaFromOriginal,
} from "../entities/kaizen.entity";
import { IKaizenRepository } from "../repositories/kaizen.repository.interface";

export interface UpdateKaizenInput {
  kaizenId: string;
  status?: KaizenStatus;
  gameId?: string;
  leaderId?: string;
  teamId?: string;
  name?: string;
  category?: number;
  currentSituation?: string;
  currentSituationImages?: string[];
  solution?: string;
  solutionImages?: string[];
  tasks?: KaizenTask[];
  benefits?: KaizenBenefit[];
  files?: string[];
  attachments?: KaizenAttachment[];
  resources?: string;
  responsibles?: KaizenResponsibles;
  kaizenIdeaId?: string;
  kaizenTypeId?: string;
}

export interface UpdateKaizenOutput {
  kaizen: KaizenEntity;
}

export const updateKaizen = async (
  input: UpdateKaizenInput,
  kaizenRepository: IKaizenRepository,
): Promise<UpdateKaizenOutput> => {
  // Busca o kaizen atual
  const currentKaizen = await kaizenRepository.findById(input.kaizenId);

  if (!currentKaizen) {
    throw new Error(`Kaizen not found: ${input.kaizenId}`);
  }

  // Atualiza a entidade de domínio
  const updatedKaizen = updateKaizenEntity(currentKaizen, {
    status: input.status,
    gameId: input.gameId,
    leaderId: input.leaderId,
    teamId: input.teamId,
    name: input.name,
    category: input.category,
    currentSituation: input.currentSituation,
    currentSituationImages: input.currentSituationImages,
    solution: input.solution,
    solutionImages: input.solutionImages,
    tasks: input.tasks,
    benefits: input.benefits,
    files: input.files,
    attachments: input.attachments,
    resources: input.resources,
    responsibles: input.responsibles,
    kaizenIdeaId: input.kaizenIdeaId,
    kaizenTypeId: input.kaizenTypeId,
  });

  // Se o kaizen tem réplicas e os campos nome/categoria foram alterados,
  // atualiza as réplicas também
  if (currentKaizen.replicas && currentKaizen.replicas.length > 0) {
    const nameChanged = input.name && input.name !== currentKaizen.name;
    const categoryChanged =
      input.category !== undefined && input.category !== currentKaizen.category;

    if (nameChanged || categoryChanged) {
      // Busca todas as réplicas
      const replicas = await kaizenRepository.findByIds(currentKaizen.replicas);

      // Atualiza cada réplica com o novo nome/categoria
      const updatedReplicas = replicas.map((replica) =>
        updateReplicaFromOriginal(replica, {
          name: updatedKaizen.name,
          category: updatedKaizen.category,
        }),
      );

      // Persiste o kaizen principal e todas as réplicas em uma transação
      await kaizenRepository.saveMultiple([updatedKaizen, ...updatedReplicas]);

      return { kaizen: updatedKaizen };
    }
  }

  // Persiste no repositório (apenas o kaizen principal)
  await kaizenRepository.save(updatedKaizen);

  return { kaizen: updatedKaizen };
};
