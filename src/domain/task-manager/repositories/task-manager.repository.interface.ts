// Interface do repositório de Task Manager

import { TaskManagerEntity } from "../entities/task-manager.entity";

export interface ITaskManagerRepository {
  // Persiste um task manager (create ou update)
  save(taskManager: TaskManagerEntity): Promise<void>;

  // Remove um task manager
  delete(gameId: string, taskManagerId: string): Promise<void>;

  // Busca um task manager por ID
  findById(
    gameId: string,
    taskManagerId: string,
  ): Promise<TaskManagerEntity | null>;

  // Lista todos os task managers de um game
  findByGameId(gameId: string): Promise<TaskManagerEntity[]>;

  // Lista task managers de um projeto
  findByProjectId(projectId: string): Promise<TaskManagerEntity[]>;
}
