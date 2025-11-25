// Use Case: Arquivar um game

import { archiveGameEntity, GameEntity } from "../entities/game.entity";
import { IGameRepository } from "../repositories/game.repository.interface";

export interface ArchiveGameInput {
  organizationId: string;
  gameId: string;
}

export interface ArchiveGameOutput {
  game: GameEntity;
}

export const archiveGame = async (
  input: ArchiveGameInput,
  gameRepository: IGameRepository,
): Promise<ArchiveGameOutput> => {
  // Busca o game atual
  const game = await gameRepository.findById(
    input.organizationId,
    input.gameId,
  );

  if (!game) {
    throw new Error(`Game not found: ${input.gameId}`);
  }

  // Arquiva o game
  const archivedGame = archiveGameEntity(game);

  // Persiste no repositório
  await gameRepository.save(archivedGame);

  return { game: archivedGame };
};
