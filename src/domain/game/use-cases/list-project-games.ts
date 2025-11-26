// Use Case: Listar todos os games de um projeto

import { GameEntity } from "../entities/game.entity";
import { IGameRepository } from "../repositories/game.repository.interface";

export interface ListProjectGamesInput {
  organizationId: string;
  projectId: string;
}

export interface ListProjectGamesOutput {
  games: GameEntity[];
}

export const listProjectGames = async (
  input: ListProjectGamesInput,
  gameRepository: IGameRepository,
): Promise<ListProjectGamesOutput> => {
  // Busca todos os games do projeto
  const games = await gameRepository.findByProjectId(
    input.organizationId,
    input.projectId,
  );

  return { games };
};
