// Use Case: Listar todas as tasks de um game

import { TaskEntity } from "../entities/task.entity";
import { ITaskRepository } from "../repositories/task.repository.interface";

export interface ListGameTasksInput {
  gameId: string;
}

export interface ListGameTasksOutput {
  tasks: TaskEntity[];
}

export const listGameTasks = async (
  input: ListGameTasksInput,
  taskRepository: ITaskRepository,
): Promise<ListGameTasksOutput> => {
  // Busca todas as tasks do game
  const tasks = await taskRepository.findByGameId(input.gameId);

  return { tasks };
};
