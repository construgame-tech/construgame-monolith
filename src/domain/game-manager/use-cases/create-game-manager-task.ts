// Use Case: Criar GameManagerTask
import { randomUUID } from "node:crypto";
import {
  createGameManagerTaskEntity,
  type GameManagerTaskEntity,
} from "../entities/game-manager-task.entity";
import type { IGameManagerTaskRepository } from "../repositories/game-manager-task.repository.interface";

export interface CreateGameManagerTaskInput {
  gameManagerId: string;
  organizationId: string;
  projectId: string;
  name: string;
  kpiId?: string;
  description?: string;
  rewardPoints?: number;
}

export interface CreateGameManagerTaskOutput {
  task: GameManagerTaskEntity;
}

export const createGameManagerTask = async (
  input: CreateGameManagerTaskInput,
  repository: IGameManagerTaskRepository,
): Promise<CreateGameManagerTaskOutput> => {
  const task = createGameManagerTaskEntity({
    id: randomUUID(),
    ...input,
  });

  await repository.save(task);

  return { task };
};
