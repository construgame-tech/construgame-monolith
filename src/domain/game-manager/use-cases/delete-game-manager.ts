// Use Case: Deletar GameManager
import type { IGameManagerRepository } from "../repositories/game-manager.repository.interface";
import type { IGameManagerTaskRepository } from "../repositories/game-manager-task.repository.interface";

export interface DeleteGameManagerInput {
  id: string;
}

export const deleteGameManager = async (
  input: DeleteGameManagerInput,
  gameManagerRepository: IGameManagerRepository,
  taskRepository: IGameManagerTaskRepository,
): Promise<void> => {
  // Deleta todas as tasks associadas primeiro
  await taskRepository.deleteByGameManagerId(input.id);
  // Depois deleta o game manager
  await gameManagerRepository.delete(input.id);
};
