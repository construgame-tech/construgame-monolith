// Use case: Replicate Kaizen
// Cria uma réplica de um kaizen existente em outro game

import { randomUUID } from "node:crypto";
import type { KaizenEntity } from "../entities/kaizen.entity";
import type { IKaizenRepository } from "../repositories/kaizen.repository.interface";

export interface ReplicateKaizenInput {
  originalKaizenId: string;
  gameId: string;
  projectId: string;
  organizationId: string;
  authorId?: string;
  leaderId?: string;
  teamId?: string;
}

export interface ReplicateKaizenOutput {
  kaizen: KaizenEntity;
}

export const replicateKaizen = async (
  input: ReplicateKaizenInput,
  repository: IKaizenRepository,
): Promise<ReplicateKaizenOutput> => {
  const original = await repository.findById(input.originalKaizenId);

  if (!original) {
    throw new Error(`Original kaizen not found: ${input.originalKaizenId}`);
  }

  // Obter próxima sequência para o game
  const existingKaizens = await repository.findByGameId(input.gameId);
  const nextSequence =
    existingKaizens.length > 0
      ? Math.max(...existingKaizens.map((k) => k.sequence)) + 1
      : 1;

  const now = new Date().toISOString();

  const replica: KaizenEntity = {
    id: randomUUID(),
    organizationId: input.organizationId,
    projectId: input.projectId,
    gameId: input.gameId,
    status: "ACTIVE",
    name: original.name,
    description: original.description,
    createdDate: now,
    sequence: nextSequence,
    originalKaizenId: input.originalKaizenId,
    authorId: input.authorId,
    leaderId: input.leaderId,
    teamId: input.teamId,
    kaizenTypeId: original.kaizenTypeId,
    currentSituation: original.currentSituation,
    currentSituationImages: original.currentSituationImages,
    solution: original.solution,
    solutionImages: original.solutionImages,
    tasks: original.tasks?.map((task) => ({
      ...task,
      isComplete: false, // Reinicia tarefas como não completas
    })),
    benefits: original.benefits,
    resources: original.resources,
  };

  await repository.save(replica);

  // Atualizar o kaizen original para registrar a réplica
  const updatedOriginal: KaizenEntity = {
    ...original,
    replicas: [...(original.replicas || []), replica.id],
    updatedDate: now,
  };
  await repository.save(updatedOriginal);

  return { kaizen: replica };
};
