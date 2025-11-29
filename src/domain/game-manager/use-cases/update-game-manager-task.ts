// Use Case: Atualizar GameManagerTask
import {
  type GameManagerTaskEntity,
  updateGameManagerTaskEntity,
} from "../entities/game-manager-task.entity";
import type { IGameManagerTaskRepository } from "../repositories/game-manager-task.repository.interface";

export interface UpdateGameManagerTaskInput {
  id: string;
  name?: string;
  kpiId?: string;
  description?: string;
  rewardPoints?: number;
}

export interface UpdateGameManagerTaskOutput {
  task: GameManagerTaskEntity;
}

export class GameManagerTaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Game Manager Task com ID ${id} não encontrada`);
    this.name = "GameManagerTaskNotFoundError";
  }
}

export const updateGameManagerTask = async (
  input: UpdateGameManagerTaskInput,
  repository: IGameManagerTaskRepository,
): Promise<UpdateGameManagerTaskOutput> => {
  const existing = await repository.findById(input.id);

  if (!existing) {
    throw new GameManagerTaskNotFoundError(input.id);
  }

  const updated = updateGameManagerTaskEntity(existing, {
    name: input.name,
    kpiId: input.kpiId,
    description: input.description,
    rewardPoints: input.rewardPoints,
  });

  await repository.save(updated);

  return { task: updated };
};
