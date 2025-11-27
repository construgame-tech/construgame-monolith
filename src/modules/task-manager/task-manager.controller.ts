import { randomUUID } from "node:crypto";
import { generateTasksFromTaskManager } from "@domain/task-manager";
import { createTaskEntity } from "@domain/task/entities/task.entity";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import { TaskManagerRepository } from "@infrastructure/repositories/task-manager.repository";
import { TaskRepository } from "@infrastructure/repositories/task.repository";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiProperty, ApiTags } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

// Nested DTOs
class MacrostepDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  macrostepId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  activityId: string;
}

class ResponsibleDto {
  @ApiProperty({ enum: ["team", "player"] })
  @IsString()
  @IsNotEmpty()
  type: "team" | "player";

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

class RecurrenceDto {
  @ApiProperty()
  @IsBoolean()
  mon: boolean;

  @ApiProperty()
  @IsBoolean()
  tue: boolean;

  @ApiProperty()
  @IsBoolean()
  wed: boolean;

  @ApiProperty()
  @IsBoolean()
  thu: boolean;

  @ApiProperty()
  @IsBoolean()
  fri: boolean;

  @ApiProperty()
  @IsBoolean()
  sat: boolean;

  @ApiProperty()
  @IsBoolean()
  sun: boolean;
}

class ScheduleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence?: RecurrenceDto;
}

class ChecklistItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;
}

// Main DTOs
class CreateTaskManagerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  kpiId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MacrostepDto)
  macrostep?: MacrostepDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  measurementUnit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  totalMeasurementExpected?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  embedVideoUrl?: string;

  @ApiProperty()
  @IsNumber()
  rewardPoints: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => ResponsibleDto)
  responsible: ResponsibleDto;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule: ScheduleDto;

  @ApiProperty({ type: [ChecklistItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];
}

class UpdateTaskManagerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  kpiId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MacrostepDto)
  macrostep?: MacrostepDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  measurementUnit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  totalMeasurementExpected?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  embedVideoUrl?: string;

  @ApiProperty()
  @IsNumber()
  rewardPoints: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => ResponsibleDto)
  responsible: ResponsibleDto;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule: ScheduleDto;

  @ApiProperty({ type: [ChecklistItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];
}

@ApiTags("task-manager")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskManagerController {
  private readonly logger = new Logger(TaskManagerController.name);

  constructor(
    @Inject(TaskManagerRepository)
    private readonly repository: TaskManagerRepository,
    @Inject(GameRepository)
    private readonly gameRepository: GameRepository,
    @Inject(TaskRepository)
    private readonly taskRepository: TaskRepository,
  ) {}

  @Post("games/:gameId/task-managers")
  async createTaskManager(
    @Param("gameId") gameId: string,
    @Body() body: CreateTaskManagerDto,
  ) {
    // Busca o game para obter organizationId e projectId
    const game = await this.gameRepository.findByIdOnly(gameId);
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    const { organizationId, projectId } = game;

    // Transform checklist items to ensure they have IDs
    const checklist = body.checklist?.map((item) => ({
      id: item.id || randomUUID(),
      label: item.label,
      checked: item.checked ?? false,
    }));

    const taskManager = await this.repository.create({
      id: randomUUID(),
      gameId,
      organizationId,
      projectId,
      name: body.name,
      kpiId: body.kpiId,
      macrostep: body.macrostep,
      description: body.description,
      measurementUnit: body.measurementUnit,
      totalMeasurementExpected: body.totalMeasurementExpected,
      videoUrl: body.videoUrl,
      embedVideoUrl: body.embedVideoUrl,
      rewardPoints: body.rewardPoints,
      location: body.location,
      responsible: body.responsible,
      schedule: body.schedule,
      checklist,
      progressAbsolute: 0,
      tasks: [],
    });

    // Converte para o tipo TaskManagerEntity esperado pelo use case (null -> undefined)
    const taskManagerEntity = {
      ...taskManager,
      macrostep: taskManager.macrostep ?? undefined,
      location: taskManager.location ?? undefined,
      description: taskManager.description ?? undefined,
      measurementUnit: taskManager.measurementUnit ?? undefined,
      totalMeasurementExpected: taskManager.totalMeasurementExpected ?? undefined,
      videoUrl: taskManager.videoUrl ?? undefined,
      embedVideoUrl: taskManager.embedVideoUrl ?? undefined,
      checklist: taskManager.checklist ?? undefined,
      tasks: taskManager.tasks ?? undefined,
    };

    // Gera e salva as tasks a partir do Task Manager
    const generatedTasks = generateTasksFromTaskManager(taskManagerEntity);
    const createdTasks: { id: string; progressAbsolute: number }[] = [];

    this.logger.log(
      `Gerando ${generatedTasks.length} tasks para Task Manager ${taskManager.id}`,
    );

    for (const genTask of generatedTasks) {
      const taskId = randomUUID();
      const taskEntity = createTaskEntity({
        id: taskId,
        gameId: genTask.gameId,
        name: genTask.name,
        rewardPoints: genTask.rewardPoints,
        kpiId: genTask.kpiId,
        taskManagerId: genTask.taskManagerId,
        description: genTask.description,
        measurementUnit: genTask.measurementUnit,
        totalMeasurementExpected: genTask.totalMeasurementExpected,
        videoUrl: genTask.videoUrl,
        embedVideoUrl: genTask.embedVideoUrl,
        location: genTask.location,
        checklist: genTask.checklist,
        startDate: genTask.startDate,
        endDate: genTask.endDate,
        teamId: genTask.responsibleType === "team" ? genTask.responsibleId : undefined,
        userId: genTask.responsibleType === "user" ? genTask.responsibleId : undefined,
      });

      await this.taskRepository.save(taskEntity);
      createdTasks.push({ id: taskId, progressAbsolute: 0 });
    }

    // Atualiza o Task Manager com os IDs das tasks criadas
    if (createdTasks.length > 0) {
      await this.repository.update(taskManager.id, {
        tasks: createdTasks,
      });
    }

    this.logger.log(
      `Tasks criadas com sucesso: ${createdTasks.length} tasks para Task Manager ${taskManager.id}`,
    );

    return {
      id: taskManager.id,
      organizationId: taskManager.organizationId,
      projectId: taskManager.projectId,
      gameId: taskManager.gameId,
      name: taskManager.name,
      kpiId: taskManager.kpiId,
      macrostep: taskManager.macrostep,
      description: taskManager.description,
      measurementUnit: taskManager.measurementUnit,
      totalMeasurementExpected: taskManager.totalMeasurementExpected,
      videoUrl: taskManager.videoUrl,
      embedVideoUrl: taskManager.embedVideoUrl,
      rewardPoints: taskManager.rewardPoints,
      location: taskManager.location,
      responsible: taskManager.responsible,
      schedule: taskManager.schedule,
      checklist: taskManager.checklist,
      tasksCreated: createdTasks.length,
    };
  }

  @Put("task-managers/:taskManagerId")
  async updateTaskManager(
    @Param("taskManagerId") taskManagerId: string,
    @Body() body: UpdateTaskManagerDto,
  ) {
    const existing = await this.repository.getById(taskManagerId);
    if (!existing) {
      throw new NotFoundException("Task manager not found");
    }

    // Preserve checked status from old checklist
    const oldChecklistMap = new Map(
      existing.checklist?.map((item) => [item.id, item.checked]) || [],
    );

    const checklist = body.checklist?.map((item) => {
      const id = item.id || randomUUID();
      return {
        id,
        label: item.label,
        checked: oldChecklistMap.get(id) || false,
      };
    });

    const updated = await this.repository.update(taskManagerId, {
      name: body.name,
      kpiId: body.kpiId,
      macrostep: body.macrostep,
      description: body.description,
      measurementUnit: body.measurementUnit,
      totalMeasurementExpected: body.totalMeasurementExpected,
      rewardPoints: body.rewardPoints,
      location: body.location,
      responsible: body.responsible,
      schedule: body.schedule,
      checklist,
      videoUrl: body.videoUrl,
      embedVideoUrl: body.embedVideoUrl,
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      projectId: updated.projectId,
      gameId: updated.gameId,
      name: updated.name,
      kpiId: updated.kpiId,
      macrostep: updated.macrostep,
      description: updated.description,
      measurementUnit: updated.measurementUnit,
      totalMeasurementExpected: updated.totalMeasurementExpected,
      videoUrl: updated.videoUrl,
      embedVideoUrl: updated.embedVideoUrl,
      rewardPoints: updated.rewardPoints,
      location: updated.location,
      responsible: updated.responsible,
      schedule: updated.schedule,
      checklist: updated.checklist,
    };
  }

  @Delete("task-managers/:taskManagerId")
  @HttpCode(204)
  async deleteTaskManager(@Param("taskManagerId") taskManagerId: string) {
    const existing = await this.repository.getById(taskManagerId);
    if (!existing) {
      throw new NotFoundException("Task manager not found");
    }

    await this.repository.delete(taskManagerId);

    return {};
  }

  @Get("games/:gameId/task-managers")
  async listTaskManagers(@Param("gameId") gameId: string) {
    const taskManagers = await this.repository.listByGameId(gameId);

    return {
      items: taskManagers.map((tm) => ({
        id: tm.id,
        organizationId: tm.organizationId,
        projectId: tm.projectId,
        gameId: tm.gameId,
        name: tm.name,
        kpiId: tm.kpiId,
        macrostep: tm.macrostep,
        description: tm.description,
        measurementUnit: tm.measurementUnit,
        totalMeasurementExpected: tm.totalMeasurementExpected,
        rewardPoints: tm.rewardPoints,
        location: tm.location,
        responsible: tm.responsible,
        schedule: tm.schedule,
        checklist: tm.checklist,
        embedVideoUrl: tm.embedVideoUrl,
        videoUrl: tm.videoUrl,
      })),
    };
  }

  // ==========================================
  // Rotas com prefixo /game singular (OpenAPI spec)
  // ==========================================

  @Get("game/:gameId/task-manager")
  async listTaskManagersSingular(@Param("gameId") gameId: string) {
    const taskManagers = await this.repository.listByGameId(gameId);

    return {
      items: taskManagers.map((tm) => ({
        id: tm.id,
        organizationId: tm.organizationId,
        projectId: tm.projectId,
        gameId: tm.gameId,
        name: tm.name,
        kpiId: tm.kpiId,
        macrostep: tm.macrostep,
        description: tm.description,
        measurementUnit: tm.measurementUnit,
        totalMeasurementExpected: tm.totalMeasurementExpected,
        rewardPoints: tm.rewardPoints,
        location: tm.location,
        responsible: tm.responsible,
        schedule: tm.schedule,
        checklist: tm.checklist,
        embedVideoUrl: tm.embedVideoUrl,
        videoUrl: tm.videoUrl,
      })),
    };
  }

  @Post("game/:gameId/task-manager")
  async createTaskManagerSingular(
    @Param("gameId") gameId: string,
    @Body() body: CreateTaskManagerDto,
  ) {
    // Busca o game para obter organizationId e projectId
    const game = await this.gameRepository.findByIdOnly(gameId);
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    const { organizationId, projectId } = game;

    const checklist = body.checklist?.map((item) => ({
      id: item.id || randomUUID(),
      label: item.label,
      checked: item.checked ?? false,
    }));

    const taskManager = await this.repository.create({
      id: randomUUID(),
      gameId,
      organizationId,
      projectId,
      name: body.name,
      kpiId: body.kpiId,
      macrostep: body.macrostep,
      description: body.description,
      measurementUnit: body.measurementUnit,
      totalMeasurementExpected: body.totalMeasurementExpected,
      videoUrl: body.videoUrl,
      embedVideoUrl: body.embedVideoUrl,
      rewardPoints: body.rewardPoints,
      location: body.location,
      responsible: body.responsible,
      schedule: body.schedule,
      checklist,
      progressAbsolute: 0,
      tasks: [],
    });

    // Converte para o tipo TaskManagerEntity esperado pelo use case (null -> undefined)
    const taskManagerEntity = {
      ...taskManager,
      macrostep: taskManager.macrostep ?? undefined,
      location: taskManager.location ?? undefined,
      description: taskManager.description ?? undefined,
      measurementUnit: taskManager.measurementUnit ?? undefined,
      totalMeasurementExpected: taskManager.totalMeasurementExpected ?? undefined,
      videoUrl: taskManager.videoUrl ?? undefined,
      embedVideoUrl: taskManager.embedVideoUrl ?? undefined,
      checklist: taskManager.checklist ?? undefined,
      tasks: taskManager.tasks ?? undefined,
    };

    // Gera e salva as tasks a partir do Task Manager
    const generatedTasks = generateTasksFromTaskManager(taskManagerEntity);
    const createdTasks: { id: string; progressAbsolute: number }[] = [];

    this.logger.log(
      `Gerando ${generatedTasks.length} tasks para Task Manager ${taskManager.id}`,
    );

    for (const genTask of generatedTasks) {
      const taskId = randomUUID();
      const taskEntity = createTaskEntity({
        id: taskId,
        gameId: genTask.gameId,
        name: genTask.name,
        rewardPoints: genTask.rewardPoints,
        kpiId: genTask.kpiId,
        taskManagerId: genTask.taskManagerId,
        description: genTask.description,
        measurementUnit: genTask.measurementUnit,
        totalMeasurementExpected: genTask.totalMeasurementExpected,
        videoUrl: genTask.videoUrl,
        embedVideoUrl: genTask.embedVideoUrl,
        location: genTask.location,
        checklist: genTask.checklist,
        startDate: genTask.startDate,
        endDate: genTask.endDate,
        teamId: genTask.responsibleType === "team" ? genTask.responsibleId : undefined,
        userId: genTask.responsibleType === "user" ? genTask.responsibleId : undefined,
      });

      await this.taskRepository.save(taskEntity);
      createdTasks.push({ id: taskId, progressAbsolute: 0 });
    }

    // Atualiza o Task Manager com os IDs das tasks criadas
    if (createdTasks.length > 0) {
      await this.repository.update(taskManager.id, {
        tasks: createdTasks,
      });
    }

    this.logger.log(
      `Tasks criadas com sucesso: ${createdTasks.length} tasks para Task Manager ${taskManager.id}`,
    );

    return {
      id: taskManager.id,
      organizationId: taskManager.organizationId,
      projectId: taskManager.projectId,
      gameId: taskManager.gameId,
      name: taskManager.name,
      kpiId: taskManager.kpiId,
      macrostep: taskManager.macrostep,
      description: taskManager.description,
      measurementUnit: taskManager.measurementUnit,
      totalMeasurementExpected: taskManager.totalMeasurementExpected,
      videoUrl: taskManager.videoUrl,
      embedVideoUrl: taskManager.embedVideoUrl,
      rewardPoints: taskManager.rewardPoints,
      location: taskManager.location,
      responsible: taskManager.responsible,
      schedule: taskManager.schedule,
      checklist: taskManager.checklist,
      tasksCreated: createdTasks.length,
    };
  }

  @Get("game/:gameId/task-manager/:taskManagerId")
  async getTaskManagerById(
    @Param("gameId") _gameId: string,
    @Param("taskManagerId") taskManagerId: string,
  ) {
    const taskManager = await this.repository.getById(taskManagerId);
    if (!taskManager) {
      throw new NotFoundException("Task manager not found");
    }

    return {
      id: taskManager.id,
      organizationId: taskManager.organizationId,
      projectId: taskManager.projectId,
      gameId: taskManager.gameId,
      name: taskManager.name,
      kpiId: taskManager.kpiId,
      macrostep: taskManager.macrostep,
      description: taskManager.description,
      measurementUnit: taskManager.measurementUnit,
      totalMeasurementExpected: taskManager.totalMeasurementExpected,
      videoUrl: taskManager.videoUrl,
      embedVideoUrl: taskManager.embedVideoUrl,
      rewardPoints: taskManager.rewardPoints,
      location: taskManager.location,
      responsible: taskManager.responsible,
      schedule: taskManager.schedule,
      checklist: taskManager.checklist,
    };
  }

  @Put("game/:gameId/task-manager/:taskManagerId")
  async updateTaskManagerSingular(
    @Param("gameId") _gameId: string,
    @Param("taskManagerId") taskManagerId: string,
    @Body() body: UpdateTaskManagerDto,
  ) {
    const existing = await this.repository.getById(taskManagerId);
    if (!existing) {
      throw new NotFoundException("Task manager not found");
    }

    const oldChecklistMap = new Map(
      existing.checklist?.map((item) => [item.id, item.checked]) || [],
    );

    const checklist = body.checklist?.map((item) => {
      const id = item.id || randomUUID();
      return {
        id,
        label: item.label,
        checked: oldChecklistMap.get(id) || false,
      };
    });

    const updated = await this.repository.update(taskManagerId, {
      name: body.name,
      kpiId: body.kpiId,
      macrostep: body.macrostep,
      description: body.description,
      measurementUnit: body.measurementUnit,
      totalMeasurementExpected: body.totalMeasurementExpected,
      rewardPoints: body.rewardPoints,
      location: body.location,
      responsible: body.responsible,
      schedule: body.schedule,
      checklist,
      videoUrl: body.videoUrl,
      embedVideoUrl: body.embedVideoUrl,
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      projectId: updated.projectId,
      gameId: updated.gameId,
      name: updated.name,
      kpiId: updated.kpiId,
      macrostep: updated.macrostep,
      description: updated.description,
      measurementUnit: updated.measurementUnit,
      totalMeasurementExpected: updated.totalMeasurementExpected,
      videoUrl: updated.videoUrl,
      embedVideoUrl: updated.embedVideoUrl,
      rewardPoints: updated.rewardPoints,
      location: updated.location,
      responsible: updated.responsible,
      schedule: updated.schedule,
      checklist: updated.checklist,
    };
  }

  @Delete("game/:gameId/task-manager/:taskManagerId")
  @HttpCode(200)
  async deleteTaskManagerSingular(
    @Param("gameId") _gameId: string,
    @Param("taskManagerId") taskManagerId: string,
  ) {
    const existing = await this.repository.getById(taskManagerId);
    if (!existing) {
      throw new NotFoundException("Task manager not found");
    }

    await this.repository.delete(taskManagerId);

    return {};
  }
}
