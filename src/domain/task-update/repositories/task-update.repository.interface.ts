// Interface do repositório de TaskUpdate
// Define o contrato para persistência, sem implementação
// A implementação real será feita na camada de infraestrutura (DynamoDB, Postgres + Drizzle, etc)

import { TaskUpdateEntity } from "../entities/task-update.entity";

export interface ITaskUpdateRepository {
  // Persiste um task update (create ou update)
  save(taskUpdate: TaskUpdateEntity): Promise<TaskUpdateEntity>;

  // Busca um task update por ID
  findById(
    taskId: string,
    taskUpdateId: string,
  ): Promise<TaskUpdateEntity | null>;

  // Lista todos os task updates de uma task
  findByTaskId(taskId: string): Promise<TaskUpdateEntity[]>;

  // Lista todos os task updates de um game
  findByGameId(gameId: string): Promise<TaskUpdateEntity[]>;
}
