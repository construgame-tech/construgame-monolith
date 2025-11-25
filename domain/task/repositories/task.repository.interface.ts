// Interface do repositório de Task
// Define o contrato para persistência, sem implementação

import { TaskEntity } from "../entities/task.entity";

export interface ITaskRepository {
  // Persiste uma task (create ou update)
  save(task: TaskEntity): Promise<void>;

  // Remove uma task
  delete(gameId: string, taskId: string): Promise<void>;

  // Busca uma task por ID
  findById(gameId: string, taskId: string): Promise<TaskEntity | null>;

  // Lista todas as tasks de um game
  findByGameId(gameId: string): Promise<TaskEntity[]>;

  // Lista tasks de um team
  findByTeamId(teamId: string): Promise<TaskEntity[]>;

  // Lista tasks de um user
  findByUserId(userId: string): Promise<TaskEntity[]>;

  // Lista tasks de um task manager
  findByTaskManagerId(taskManagerId: string): Promise<TaskEntity[]>;
}
