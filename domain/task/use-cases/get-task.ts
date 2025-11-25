// Use Case: Buscar uma task por ID

import { TaskEntity } from "../entities/task.entity";
import { ITaskRepository } from "../repositories/task.repository.interface";

export interface GetTaskInput {
  gameId: string;
  taskId: string;
}

export interface GetTaskOutput {
  task: TaskEntity;
}

export const getTask = async (
  input: GetTaskInput,
  taskRepository: ITaskRepository,
): Promise<GetTaskOutput> => {
  // Busca a task
  const task = await taskRepository.findById(input.gameId, input.taskId);

  if (!task) {
    throw new Error(`Task not found: ${input.taskId}`);
  }

  return { task };
};
