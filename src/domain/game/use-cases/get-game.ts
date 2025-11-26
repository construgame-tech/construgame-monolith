// Use Case: Buscar um game por ID

import { GameEntity } from "../entities/game.entity";
import { IGameRepository } from "../repositories/game.repository.interface";

export interface GetGameInput {
  organizationId: string;
  gameId: string;
}

export interface GetGameOutput {
  game: GameEntity | null;
}

export const getGame = async (
  input: GetGameInput,
  gameRepository: IGameRepository,
): Promise<GetGameOutput> => {
  // Busca o game
  const game = await gameRepository.findById(
    input.organizationId,
    input.gameId,
  );

  return { game };
};
