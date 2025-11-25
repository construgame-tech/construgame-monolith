// Interface do repositório de Game
// Define o contrato para persistência, sem implementação
// A implementação real será feita na camada de infraestrutura (DynamoDB, Postgres + Drizzle, etc)

import { GameEntity } from "../entities/game.entity";

export interface IGameRepository {
  // Persiste um game (create ou update)
  save(game: GameEntity): Promise<void>;

  // Remove um game
  delete(organizationId: string, gameId: string): Promise<void>;

  // Busca um game por ID
  findById(organizationId: string, gameId: string): Promise<GameEntity | null>;

  // Lista todos os games de uma organização
  findByOrganizationId(organizationId: string): Promise<GameEntity[]>;

  // Lista games de um projeto
  findByProjectId(
    organizationId: string,
    projectId: string,
  ): Promise<GameEntity[]>;
}
