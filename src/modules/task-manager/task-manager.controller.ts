import { randomUUID } from "node:crypto";
import { TaskManagerRepository } from "@infrastructure/repositories/task-manager.repository";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

// DTOs
class CreateTaskManagerDto {
  name: string;
  kpiId: string;
  macrostep?: {
    macrostepId: string;
    activityId: string;
  };
  description?: string;
  measurementUnit?: string;
  totalMeasurementExpected?: string;
  videoUrl?: string;
  embedVideoUrl?: string;
  rewardPoints: number;
  location?: string;
  responsible: {
    type: "team" | "player";
    ids: string[];
  };
  schedule: {
    startDate: string;
    endDate: string;
    recurrence?: {
      mon: boolean;
      tue: boolean;
      wed: boolean;
      thu: boolean;
      fri: boolean;
      sat: boolean;
      sun: boolean;
    };
  };
  checklist?: Array<{
    id?: string;
    label: string;
  }>;
}

class UpdateTaskManagerDto {
  name: string;
  kpiId: string;
  macrostep?: {
    macrostepId: string;
    activityId: string;
  };
  description?: string;
  measurementUnit?: string;
  totalMeasurementExpected?: string;
  videoUrl?: string;
  embedVideoUrl?: string;
  rewardPoints: number;
  location?: string;
  responsible: {
    type: "team" | "player";
    ids: string[];
  };
  schedule: {
    startDate: string;
    endDate: string;
    recurrence?: {
      mon: boolean;
      tue: boolean;
      wed: boolean;
      thu: boolean;
      fri: boolean;
      sat: boolean;
      sun: boolean;
    };
  };
  checklist?: Array<{
    id?: string;
    label: string;
  }>;
}

@ApiTags("task-manager")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskManagerController {
  constructor(
    @Inject(TaskManagerRepository)
    private readonly repository: TaskManagerRepository,
  ) {}

  @Post("games/:gameId/task-managers")
  async createTaskManager(
    @Param("gameId") gameId: string,
    @Query("organizationId") organizationId: string,
    @Query("projectId") projectId: string,
    @Body() body: CreateTaskManagerDto,
  ) {
    if (!organizationId || !projectId) {
      throw new BadRequestException(
        "organizationId and projectId are required as query parameters",
      );
    }

    // Transform checklist items to ensure they have IDs
    const checklist = body.checklist?.map((item) => ({
      id: item.id || randomUUID(),
      label: item.label,
      checked: false,
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
      sequence: 0,
    });

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
      sequence: existing.sequence + 1,
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
}
