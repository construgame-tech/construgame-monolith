// Use Case: Listar todos os games de uma organização

import { GameEntity } from "../entities/game.entity";
import { IGameRepository } from "../repositories/game.repository.interface";

export interface ListOrganizationGamesInput {
  organizationId: string;
}

export interface ListOrganizationGamesOutput {
  games: GameEntity[];
}

export const listOrganizationGames = async (
  input: ListOrganizationGamesInput,
  gameRepository: IGameRepository,
): Promise<ListOrganizationGamesOutput> => {
  // Busca todos os games da organização
  const games = await gameRepository.findByOrganizationId(input.organizationId);

  return { games };
};
