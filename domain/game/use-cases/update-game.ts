// Use Case: Atualizar um game existente

import {
  GameEntity,
  GameKpi,
  GamePrize,
  GameStatus,
  updateGameEntity,
} from "../entities/game.entity";
import { IGameRepository } from "../repositories/game.repository.interface";

export interface UpdateGameInput {
  organizationId: string;
  gameId: string;
  status?: GameStatus;
  name?: string;
  photo?: string;
  startDate?: string;
  endDate?: string;
  managerId?: string;
  responsibles?: string[];
  objective?: string;
  prizes?: GamePrize[];
  updateFrequency?: number;
  kpis?: GameKpi[];
}

export interface UpdateGameOutput {
  game: GameEntity;
}

export const updateGame = async (
  input: UpdateGameInput,
  gameRepository: IGameRepository,
): Promise<UpdateGameOutput> => {
  // Busca o game atual
  const currentGame = await gameRepository.findById(
    input.organizationId,
    input.gameId,
  );

  if (!currentGame) {
    throw new Error(`Game not found: ${input.gameId}`);
  }

  // Aplica as atualizações na entidade
  const updatedGame = updateGameEntity(currentGame, {
    status: input.status,
    name: input.name,
    photo: input.photo,
    startDate: input.startDate,
    endDate: input.endDate,
    managerId: input.managerId,
    responsibles: input.responsibles,
    objective: input.objective,
    prizes: input.prizes,
    updateFrequency: input.updateFrequency,
    kpis: input.kpis,
  });

  // Persiste no repositório
  await gameRepository.save(updatedGame);

  return { game: updatedGame };
};
