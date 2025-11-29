// Interface do repositório de GameManager
// Define o contrato que a camada de infraestrutura deve implementar
import type { GameManagerEntity } from "../entities/game-manager.entity";

export interface IGameManagerRepository {
  save(gameManager: GameManagerEntity): Promise<void>;
  findById(id: string): Promise<GameManagerEntity | null>;
  findByOrganizationId(organizationId: string): Promise<GameManagerEntity[]>;
  delete(id: string): Promise<void>;
}
