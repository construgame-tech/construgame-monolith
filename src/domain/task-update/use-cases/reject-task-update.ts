// Use Case: Rejeitar um task update

import {
  rejectTaskUpdateEntity,
  TaskUpdateEntity,
  validateCanReject,
} from "../entities/task-update.entity";
import { ITaskUpdateRepository } from "../repositories/task-update.repository.interface";

export interface RejectTaskUpdateInput {
  taskId: string;
  taskUpdateId: string;
  reviwedBy: string;
  reviewNote?: string;
}

export interface RejectTaskUpdateOutput {
  taskUpdate: TaskUpdateEntity;
}

export const rejectTaskUpdate = async (
  input: RejectTaskUpdateInput,
  taskUpdateRepository: ITaskUpdateRepository,
): Promise<RejectTaskUpdateOutput> => {
  // Busca o task update atual
  const currentTaskUpdate = await taskUpdateRepository.findById(
    input.taskId,
    input.taskUpdateId,
  );

  if (!currentTaskUpdate) {
    throw new Error(`Task update not found: ${input.taskUpdateId}`);
  }

  // Valida se o task update pode ser rejeitado
  validateCanReject(currentTaskUpdate);

  // Aplica a rejeição na entidade
  const rejectedTaskUpdate = rejectTaskUpdateEntity(currentTaskUpdate, {
    reviwedBy: input.reviwedBy,
    reviewNote: input.reviewNote,
  });

  // Persiste no repositório
  await taskUpdateRepository.save(rejectedTaskUpdate);

  return { taskUpdate: rejectedTaskUpdate };
};
