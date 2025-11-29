// Use Case: Listar Tasks de um GameManager
import type { GameManagerTaskEntity } from "../entities/game-manager-task.entity";
import type { IGameManagerTaskRepository } from "../repositories/game-manager-task.repository.interface";

export interface ListGameManagerTasksInput {
  gameManagerId: string;
}

export interface ListGameManagerTasksOutput {
  tasks: GameManagerTaskEntity[];
}

export const listGameManagerTasks = async (
  input: ListGameManagerTasksInput,
  repository: IGameManagerTaskRepository,
): Promise<ListGameManagerTasksOutput> => {
  const tasks = await repository.findByGameManagerId(input.gameManagerId);
  return { tasks };
};
