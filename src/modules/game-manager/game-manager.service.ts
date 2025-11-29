// Service de Game Manager
// Orquestra os use cases do domínio

import {
  createGameManager,
  createGameManagerTask,
  deleteGameManager,
  deleteGameManagerTask,
  GameManagerNotFoundError,
  GameManagerTaskNotFoundError,
  getGameManager,
  listGameManagers,
  listGameManagerTasks,
  updateGameManager,
  updateGameManagerTask,
} from "@domain/game-manager";
import { GameManagerRepository } from "@infrastructure/repositories/game-manager.repository";
import { GameManagerTaskRepository } from "@infrastructure/repositories/game-manager-task.repository";
import { Injectable, NotFoundException } from "@nestjs/common";

// Game Manager

export interface CreateGameManagerInput {
  organizationId: string;
  projectId: string;
  name: string;
  photo?: string;
  objective?: string;
  updateFrequency?: number;
  managerId?: string;
  responsibles?: string[];
  startDate?: string;
  endDate?: string;
  gameLength?: number;
}

export interface UpdateGameManagerInput {
  id: string;
  name?: string;
  photo?: string;
  objective?: string;
  updateFrequency?: number;
  managerId?: string;
  responsibles?: string[];
  startDate?: string;
  endDate?: string;
  gameLength?: number;
}

// Game Manager Task

export interface CreateGameManagerTaskInput {
  gameManagerId: string;
  organizationId: string;
  projectId: string;
  name: string;
  kpiId?: string;
  description?: string;
  rewardPoints?: number;
}

export interface UpdateGameManagerTaskInput {
  id: string;
  name?: string;
  kpiId?: string;
  description?: string;
  rewardPoints?: number;
}

@Injectable()
export class GameManagerService {
  constructor(
    private readonly gameManagerRepository: GameManagerRepository,
    private readonly gameManagerTaskRepository: GameManagerTaskRepository,
  ) {}

  // ==========================================
  // Game Manager
  // ==========================================

  async create(input: CreateGameManagerInput) {
    const result = await createGameManager(input, this.gameManagerRepository);
    return result.gameManager;
  }

  async update(input: UpdateGameManagerInput) {
    try {
      const result = await updateGameManager(input, this.gameManagerRepository);
      return result.gameManager;
    } catch (error) {
      if (error instanceof GameManagerNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async findById(id: string) {
    const result = await getGameManager({ id }, this.gameManagerRepository);
    return result.gameManager;
  }

  async findByOrganizationId(organizationId: string) {
    const result = await listGameManagers(
      { organizationId },
      this.gameManagerRepository,
    );
    return result.gameManagers;
  }

  async delete(id: string) {
    await deleteGameManager(
      { id },
      this.gameManagerRepository,
      this.gameManagerTaskRepository,
    );
  }

  // ==========================================
  // Game Manager Task
  // ==========================================

  async createTask(input: CreateGameManagerTaskInput) {
    const result = await createGameManagerTask(
      input,
      this.gameManagerTaskRepository,
    );
    return result.task;
  }

  async updateTask(input: UpdateGameManagerTaskInput) {
    try {
      const result = await updateGameManagerTask(
        input,
        this.gameManagerTaskRepository,
      );
      return result.task;
    } catch (error) {
      if (error instanceof GameManagerTaskNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async findTaskById(id: string) {
    const task = await this.gameManagerTaskRepository.findById(id);
    return task;
  }

  async findTasksByGameManagerId(gameManagerId: string) {
    const result = await listGameManagerTasks(
      { gameManagerId },
      this.gameManagerTaskRepository,
    );
    return result.tasks;
  }

  async deleteTask(id: string) {
    await deleteGameManagerTask({ id }, this.gameManagerTaskRepository);
  }
}
