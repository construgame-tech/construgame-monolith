// Use Case: Criar GameManager
import { randomUUID } from "node:crypto";
import {
  createGameManagerEntity,
  type GameManagerEntity,
} from "../entities/game-manager.entity";
import type { IGameManagerRepository } from "../repositories/game-manager.repository.interface";

export interface CreateGameManagerInput {
  organizationId: string;
  projectId: string;
  name: string;
  photo?: string;
  objective?: string;
  updateFrequency?: number;
  managerId?: string;
  responsibles?: string[];
  startDate?: string;
  endDate?: string;
  gameLength?: number;
}

export interface CreateGameManagerOutput {
  gameManager: GameManagerEntity;
}

export const createGameManager = async (
  input: CreateGameManagerInput,
  repository: IGameManagerRepository,
): Promise<CreateGameManagerOutput> => {
  const gameManager = createGameManagerEntity({
    id: randomUUID(),
    ...input,
  });

  await repository.save(gameManager);

  return { gameManager };
};
