// Use Case: Listar GameManagers de uma Organização
import type { GameManagerEntity } from "../entities/game-manager.entity";
import type { IGameManagerRepository } from "../repositories/game-manager.repository.interface";

export interface ListGameManagersInput {
  organizationId: string;
}

export interface ListGameManagersOutput {
  gameManagers: GameManagerEntity[];
}

export const listGameManagers = async (
  input: ListGameManagersInput,
  repository: IGameManagerRepository,
): Promise<ListGameManagersOutput> => {
  const gameManagers = await repository.findByOrganizationId(
    input.organizationId,
  );
  return { gameManagers };
};
