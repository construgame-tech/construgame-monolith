// Use Case: Atualizar GameManager
import {
  type GameManagerEntity,
  updateGameManagerEntity,
} from "../entities/game-manager.entity";
import type { IGameManagerRepository } from "../repositories/game-manager.repository.interface";

export interface UpdateGameManagerInput {
  id: string;
  name?: string;
  photo?: string;
  objective?: string;
  updateFrequency?: number;
  managerId?: string;
  responsibles?: string[];
  startDate?: string;
  endDate?: string;
  gameLength?: number;
}

export interface UpdateGameManagerOutput {
  gameManager: GameManagerEntity;
}

export class GameManagerNotFoundError extends Error {
  constructor(id: string) {
    super(`Game Manager com ID ${id} não encontrado`);
    this.name = "GameManagerNotFoundError";
  }
}

export const updateGameManager = async (
  input: UpdateGameManagerInput,
  repository: IGameManagerRepository,
): Promise<UpdateGameManagerOutput> => {
  const existing = await repository.findById(input.id);

  if (!existing) {
    throw new GameManagerNotFoundError(input.id);
  }

  const updated = updateGameManagerEntity(existing, {
    name: input.name,
    photo: input.photo,
    objective: input.objective,
    updateFrequency: input.updateFrequency,
    managerId: input.managerId,
    responsibles: input.responsibles,
    startDate: input.startDate,
    endDate: input.endDate,
    gameLength: input.gameLength,
  });

  await repository.save(updated);

  return { gameManager: updated };
};
