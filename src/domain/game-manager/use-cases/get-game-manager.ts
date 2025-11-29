// Use Case: Obter GameManager por ID
import type { GameManagerEntity } from "../entities/game-manager.entity";
import type { IGameManagerRepository } from "../repositories/game-manager.repository.interface";

export interface GetGameManagerInput {
  id: string;
}

export interface GetGameManagerOutput {
  gameManager: GameManagerEntity | null;
}

export const getGameManager = async (
  input: GetGameManagerInput,
  repository: IGameManagerRepository,
): Promise<GetGameManagerOutput> => {
  const gameManager = await repository.findById(input.id);
  return { gameManager };
};
