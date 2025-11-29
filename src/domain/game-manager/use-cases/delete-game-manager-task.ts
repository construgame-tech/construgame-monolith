// Use Case: Deletar GameManagerTask
import type { IGameManagerTaskRepository } from "../repositories/game-manager-task.repository.interface";

export interface DeleteGameManagerTaskInput {
  id: string;
}

export const deleteGameManagerTask = async (
  input: DeleteGameManagerTaskInput,
  repository: IGameManagerTaskRepository,
): Promise<void> => {
  await repository.delete(input.id);
};
