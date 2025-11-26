// Use Case: Aprovar um task update

import {
  approveTaskUpdateEntity,
  TaskUpdateChecklistItem,
  TaskUpdateEntity,
  validateCanApprove,
} from "../entities/task-update.entity";
import { ITaskUpdateRepository } from "../repositories/task-update.repository.interface";

export interface ApproveTaskUpdateInput {
  taskId: string;
  taskUpdateId: string;
  reviwedBy?: string;
  reviewNote?: string;
  progressAbsolute?: number;
  participants?: string[];
  checklist?: TaskUpdateChecklistItem[];
  startDate?: Date;
  endDate?: Date;
}

export interface ApproveTaskUpdateOutput {
  taskUpdate: TaskUpdateEntity;
}

export const approveTaskUpdate = async (
  input: ApproveTaskUpdateInput,
  taskUpdateRepository: ITaskUpdateRepository,
): Promise<ApproveTaskUpdateOutput> => {
  // Busca o task update atual
  const currentTaskUpdate = await taskUpdateRepository.findById(
    input.taskId,
    input.taskUpdateId,
  );

  if (!currentTaskUpdate) {
    throw new Error(`Task update not found: ${input.taskUpdateId}`);
  }

  // Valida se o task update pode ser aprovado
  validateCanApprove(currentTaskUpdate);

  // Aplica a aprovação na entidade
  const approvedTaskUpdate = approveTaskUpdateEntity(currentTaskUpdate, {
    reviwedBy: input.reviwedBy,
    reviewNote: input.reviewNote,
    progressAbsolute: input.progressAbsolute,
    participants: input.participants,
    checklist: input.checklist,
    startDate: input.startDate,
    endDate: input.endDate,
  });

  // Persiste no repositório
  await taskUpdateRepository.save(approvedTaskUpdate);

  return { taskUpdate: approvedTaskUpdate };
};
