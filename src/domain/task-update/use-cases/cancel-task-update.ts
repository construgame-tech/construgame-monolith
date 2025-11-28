// Use Case: Cancelar a aprovação de um task update (volta para PENDING_REVIEW)

import {
  cancelTaskUpdateEntity,
  TaskUpdateEntity,
} from "../entities/task-update.entity";
import { ITaskUpdateRepository } from "../repositories/task-update.repository.interface";

export interface CancelTaskUpdateInput {
  taskId: string;
  taskUpdateId: string;
}

export interface CancelTaskUpdateOutput {
  taskUpdate: TaskUpdateEntity;
}

export const cancelTaskUpdate = async (
  input: CancelTaskUpdateInput,
  taskUpdateRepository: ITaskUpdateRepository,
): Promise<CancelTaskUpdateOutput> => {
  // Busca o task update atual
  const currentTaskUpdate = await taskUpdateRepository.findById(
    input.taskId,
    input.taskUpdateId,
  );

  if (!currentTaskUpdate) {
    throw new Error(`Task update not found: ${input.taskUpdateId}`);
  }

  // Valida se o task update pode ser cancelado (deve estar APPROVED)
  if (currentTaskUpdate.status !== "APPROVED") {
    throw new Error(
      "Task update must be in APPROVED status to be cancelled",
    );
  }

  // Aplica o cancelamento na entidade
  const cancelledTaskUpdate = cancelTaskUpdateEntity(currentTaskUpdate);

  // Persiste no repositório
  await taskUpdateRepository.save(cancelledTaskUpdate);

  return { taskUpdate: cancelledTaskUpdate };
};
