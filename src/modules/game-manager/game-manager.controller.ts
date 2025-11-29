// Game Manager Controller
// Rotas REST API para gerenciamento de game managers

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
import { GameManagerService } from "./game-manager.service";

@ApiTags("game-manager")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/game-manager")
export class GameManagerController {
  constructor(private readonly gameManagerService: GameManagerService) {}

  @Get()
  @ApiOperation({ summary: "List organization game managers" })
  @ApiParam({ name: "organizationId" })
  async list(@Param("organizationId") organizationId: string) {
    const items =
      await this.gameManagerService.findByOrganizationId(organizationId);
    return { items };
  }

  @Post()
  @ApiOperation({ summary: "Create game manager" })
  @ApiParam({ name: "organizationId" })
  async create(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateGameManagerDto,
  ) {
    return this.gameManagerService.create({
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
    });
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
    const existing = await this.gameManagerService.findById(gameManagerId);
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    return this.gameManagerService.update({
      id: gameManagerId,
      name: dto.name,
      photo: dto.photo,
      objective: dto.objective,
      updateFrequency: dto.updateFrequency,
      managerId: dto.managerId,
      responsibles: dto.responsibles,
      startDate: dto.startDate,
      endDate: dto.endDate,
      gameLength: dto.gameLength,
    });
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
    const existing = await this.gameManagerService.findById(gameManagerId);
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    await this.gameManagerService.delete(gameManagerId);

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
    const gameManager = await this.gameManagerService.findById(gameManagerId);
    if (!gameManager || gameManager.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    const items =
      await this.gameManagerService.findTasksByGameManagerId(gameManagerId);
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
    const gameManager = await this.gameManagerService.findById(gameManagerId);
    if (!gameManager || gameManager.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    return this.gameManagerService.createTask({
      gameManagerId,
      organizationId,
      projectId: dto.projectId,
      name: dto.name,
      kpiId: dto.kpiId,
      description: dto.description,
      rewardPoints: dto.rewardPoints,
    });
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
    const gameManager = await this.gameManagerService.findById(gameManagerId);
    if (!gameManager || gameManager.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    const existing = await this.gameManagerService.findTaskById(taskManagerId);
    if (!existing || existing.gameManagerId !== gameManagerId) {
      throw new NotFoundException("Task manager not found");
    }

    return this.gameManagerService.updateTask({
      id: taskManagerId,
      name: dto.name,
      kpiId: dto.kpiId,
      description: dto.description,
      rewardPoints: dto.rewardPoints,
    });
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
    const gameManager = await this.gameManagerService.findById(gameManagerId);
    if (!gameManager || gameManager.organizationId !== organizationId) {
      throw new NotFoundException("Game manager not found");
    }

    const existing = await this.gameManagerService.findTaskById(taskManagerId);
    if (!existing || existing.gameManagerId !== gameManagerId) {
      throw new NotFoundException("Task manager not found");
    }

    await this.gameManagerService.deleteTask(taskManagerId);

    return { message: "Task manager deleted" };
  }
}
