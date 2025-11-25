// Use Case: Deletar uma task

import { ITaskRepository } from "../repositories/task.repository.interface";

export interface DeleteTaskInput {
  gameId: string;
  taskId: string;
}

export interface DeleteTaskOutput {
  success: boolean;
}

export const deleteTask = async (
  input: DeleteTaskInput,
  taskRepository: ITaskRepository,
): Promise<DeleteTaskOutput> => {
  // Verifica se a task existe
  const task = await taskRepository.findById(input.gameId, input.taskId);

  if (!task) {
    // Se não existe, retorna sucesso (idempotência)
    return { success: true };
  }

  // Deleta do repositório
  await taskRepository.delete(input.gameId, input.taskId);

  return { success: true };
};
