// Interface do repositório de GameManagerTask
// Define o contrato que a camada de infraestrutura deve implementar
import type { GameManagerTaskEntity } from "../entities/game-manager-task.entity";

export interface IGameManagerTaskRepository {
  save(task: GameManagerTaskEntity): Promise<void>;
  findById(id: string): Promise<GameManagerTaskEntity | null>;
  findByGameManagerId(gameManagerId: string): Promise<GameManagerTaskEntity[]>;
  delete(id: string): Promise<void>;
  deleteByGameManagerId(gameManagerId: string): Promise<void>;
}
