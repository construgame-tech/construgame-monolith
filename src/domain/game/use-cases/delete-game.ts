// Use Case: Deletar um game

import { IGameRepository } from "../repositories/game.repository.interface";

export interface DeleteGameInput {
  organizationId: string;
  gameId: string;
}

export interface DeleteGameOutput {
  success: boolean;
}

export const deleteGame = async (
  input: DeleteGameInput,
  gameRepository: IGameRepository,
): Promise<DeleteGameOutput> => {
  // Verifica se o game existe
  const game = await gameRepository.findById(
    input.organizationId,
    input.gameId,
  );

  if (!game) {
    throw new Error(`Game not found: ${input.gameId}`);
  }

  // Deleta do repositório
  await gameRepository.delete(input.organizationId, input.gameId);

  return { success: true };
};
