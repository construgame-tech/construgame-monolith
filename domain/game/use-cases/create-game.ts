// Use Case: Criar um novo game

import { randomUUID } from "crypto";
import {
  createGameEntity,
  GameEntity,
  GameKpi,
  GamePrize,
} from "../entities/game.entity";
import { IGameRepository } from "../repositories/game.repository.interface";

export interface CreateGameInput {
  organizationId: string;
  projectId: string;
  name: string;
  gameManagerId?: string;
  photo?: string;
  startDate?: string;
  endDate?: string;
  managerId?: string;
  responsibles?: string[];
  objective?: string;
  prizes?: GamePrize[];
  kpis?: GameKpi[];
  updateFrequency?: number;
}

export interface CreateGameOutput {
  game: GameEntity;
}

export const createGame = async (
  input: CreateGameInput,
  gameRepository: IGameRepository,
): Promise<CreateGameOutput> => {
  // Gera um ID único para o novo game
  const gameId = randomUUID();

  // Cria a entidade de domínio
  const game = createGameEntity({
    id: gameId,
    organizationId: input.organizationId,
    projectId: input.projectId,
    name: input.name,
    gameManagerId: input.gameManagerId,
    photo: input.photo,
    startDate: input.startDate,
    endDate: input.endDate,
    managerId: input.managerId,
    responsibles: input.responsibles,
    objective: input.objective,
    prizes: input.prizes,
    kpis: input.kpis,
    updateFrequency: input.updateFrequency,
  });

  // Persiste no repositório
  await gameRepository.save(game);

  return { game };
};
