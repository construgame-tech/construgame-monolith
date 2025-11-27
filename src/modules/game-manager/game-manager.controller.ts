// Game Manager Controller
// Rotas REST API para gerenciamento de game managers

import { randomUUID } from "node:crypto";
import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreateGameManagerDto,
  UpdateGameManagerDto,
} from "./dto/game-manager.dto";

// In-memory storage for MVP (can be replaced with DB repository later)
interface GameManagerEntity {
  id: string;
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

interface TaskManagerInGameManager {
  id: string;
  gameManagerId: string;
  organizationId: string;
  projectId: string;
  name: string;
  kpiId?: string;
  description?: string;
  rewardPoints?: number;
}

const gameManagersStore = new Map<string, GameManagerEntity>();
const gameManagerTasksStore = new Map<string, TaskManagerInGameManager>();

@ApiTags("game-manager")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/game-manager")
export class GameManagerController {
  @Get()
  @ApiOperation({ summary: "List organization game managers" })
  @ApiParam({ name: "organizationId" })
  async list(@Param("organizationId") organizationId: string) {
    const items = Array.from(gameManagersStore.values()).filter(
      (gm) => gm.organizationId === organizationId,
    );
    return { items };
  }

  @Post()
  @ApiOperation({ summary: "Create game manager" })
  @ApiParam({ name: "organizationId" })
  async create(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateGameManagerDto,
  ) {
    const id = randomUUID();
    const gameManager: GameManagerEntity = {
      id,
      organizationId,
      projectId: dto.projectId,
      name: dto.name,
      photo: dto.photo,
      objective: dto.objective,
      updateFrequency: dto.updateFrequency,
      managerId: dto.managerId,
      responsibles: dto.responsibles,
      startDate: dto.startDate,
      endDate: dto.endDate,
      gameLength: dto.gameLength,
    };

    gameManagersStore.set(id, gameManager);

    return gameManager;
  }

  @Put(":gameManagerId")
  @ApiOperation({ summary: "Update game manager" })
  @ApiParam({ name: "organizationId" })
  @ApiParam({ name: "gameManagerId" })
  async update(
    @Param("organizationId") organizationId: string,
    @Param("gameManagerId") gameManagerId: string,
    @Body() dto: UpdateGameManagerDto,
  ) {
    const existing = gameManagersStore.get(gameManagerId);
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    const updated: GameManagerEntity = {
      ...existing,
      name: dto.name ?? existing.name,
      photo: dto.photo ?? existing.photo,
      objective: dto.objective ?? existing.objective,
      updateFrequency: dto.updateFrequency ?? existing.updateFrequency,
      managerId: dto.managerId ?? existing.managerId,
      responsibles: dto.responsibles ?? existing.responsibles,
      startDate: dto.startDate ?? existing.startDate,
      endDate: dto.endDate ?? existing.endDate,
      gameLength: dto.gameLength ?? existing.gameLength,
    };

    gameManagersStore.set(gameManagerId, updated);

    return updated;
  }

  @Delete(":gameManagerId")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete game manager" })
  @ApiParam({ name: "organizationId" })
  @ApiParam({ name: "gameManagerId" })
  async delete(
    @Param("organizationId") organizationId: string,
    @Param("gameManagerId") gameManagerId: string,
  ) {
    const existing = gameManagersStore.get(gameManagerId);
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    // Delete associated tasks
    for (const [id, task] of gameManagerTasksStore.entries()) {
      if (task.gameManagerId === gameManagerId) {
        gameManagerTasksStore.delete(id);
      }
    }

    gameManagersStore.delete(gameManagerId);

    return { message: "Game manager deleted" };
  }

  // ==========================================
  // Task Manager dentro de Game Manager
  // ==========================================

  @Get(":gameManagerId/task-manager")
  @ApiOperation({ summary: "List game manager tasks" })
  @ApiParam({ name: "organizationId" })
  @ApiParam({ name: "gameManagerId" })
  async listTasks(
    @Param("organizationId") organizationId: string,
    @Param("gameManagerId") gameManagerId: string,
  ) {
    const gameManager = gameManagersStore.get(gameManagerId);
    if (!gameManager || gameManager.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    const items = Array.from(gameManagerTasksStore.values()).filter(
      (t) => t.gameManagerId === gameManagerId,
    );
    return { items };
  }

  @Post(":gameManagerId/task-manager")
  @ApiOperation({ summary: "Create game manager task" })
  @ApiParam({ name: "organizationId" })
  @ApiParam({ name: "gameManagerId" })
  async createTask(
    @Param("organizationId") organizationId: string,
    @Param("gameManagerId") gameManagerId: string,
    @Body()
    dto: {
      name: string;
      projectId: string;
      kpiId?: string;
      description?: string;
      rewardPoints?: number;
    },
  ) {
    const gameManager = gameManagersStore.get(gameManagerId);
    if (!gameManager || gameManager.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    const id = randomUUID();
    const task: TaskManagerInGameManager = {
      id,
      gameManagerId,
      organizationId,
      projectId: dto.projectId,
      name: dto.name,
      kpiId: dto.kpiId,
      description: dto.description,
      rewardPoints: dto.rewardPoints,
    };

    gameManagerTasksStore.set(id, task);

    return task;
  }

  @Put(":gameManagerId/task-manager/:taskManagerId")
  @ApiOperation({ summary: "Update game manager task" })
  @ApiParam({ name: "organizationId" })
  @ApiParam({ name: "gameManagerId" })
  @ApiParam({ name: "taskManagerId" })
  async updateTask(
    @Param("organizationId") organizationId: string,
    @Param("gameManagerId") gameManagerId: string,
    @Param("taskManagerId") taskManagerId: string,
    @Body()
    dto: {
      name?: string;
      kpiId?: string;
      description?: string;
      rewardPoints?: number;
    },
  ) {
    const gameManager = gameManagersStore.get(gameManagerId);
    if (!gameManager || gameManager.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    const existing = gameManagerTasksStore.get(taskManagerId);
    if (!existing || existing.gameManagerId !== gameManagerId) {
      throw new NotFoundException("Task manager not found");
    }

    const updated: TaskManagerInGameManager = {
      ...existing,
      name: dto.name ?? existing.name,
      kpiId: dto.kpiId ?? existing.kpiId,
      description: dto.description ?? existing.description,
      rewardPoints: dto.rewardPoints ?? existing.rewardPoints,
    };

    gameManagerTasksStore.set(taskManagerId, updated);

    return updated;
  }

  @Delete(":gameManagerId/task-manager/:taskManagerId")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete game manager task" })
  @ApiParam({ name: "organizationId" })
  @ApiParam({ name: "gameManagerId" })
  @ApiParam({ name: "taskManagerId" })
  async deleteTask(
    @Param("organizationId") organizationId: string,
    @Param("gameManagerId") gameManagerId: string,
    @Param("taskManagerId") taskManagerId: string,
  ) {
    const gameManager = gameManagersStore.get(gameManagerId);
    if (!gameManager || gameManager.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    const existing = gameManagerTasksStore.get(taskManagerId);
    if (!existing || existing.gameManagerId !== gameManagerId) {
      throw new NotFoundException("Task manager not found");
    }

    gameManagerTasksStore.delete(taskManagerId);

    return { message: "Task manager deleted" };
  }
}
