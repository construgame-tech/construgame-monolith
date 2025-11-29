import { randomUUID } from "node:crypto";
import { calculateMacrostepProgress } from "@domain/project-planning";
import { ProjectPlanningRepository } from "@infrastructure/repositories/project-planning.repository";
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
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiProperty, ApiTags } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

// Nested DTOs
class LaborCompositionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobRoleId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobRoleName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobRoleSeniority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  hourlyCost?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  dailyProductivity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  laborHours?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  personQuantity?: number;
}

class PrizePerRangeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobRoleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobRoleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobRoleSeniority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  range?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  prizeAmount?: number;
}

class PrizePerProductivityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobRoleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobRoleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobRoleSeniority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  productivity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  unityQuantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  prizeAmount?: number;
}

// Main DTOs
class CreateMacrostepDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string;
}

class UpdateMacrostepDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

class CreateActivityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  totalMeasurementExpected?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  measurementUnit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  expectedCost?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  trackingValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  trackingUnit?: string;

  @ApiProperty({ type: [LaborCompositionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LaborCompositionDto)
  laborCompositionList?: LaborCompositionDto[];

  @ApiProperty({ type: [PrizePerRangeDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrizePerRangeDto)
  prizesPerRange?: PrizePerRangeDto[];

  @ApiProperty({ type: [PrizePerProductivityDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrizePerProductivityDto)
  prizesPerProductivity?: PrizePerProductivityDto[];
}

class UpdateActivityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  totalMeasurementExpected?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  measurementUnit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  expectedCost?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  trackingValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  trackingUnit?: string;

  @ApiProperty({ type: [LaborCompositionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LaborCompositionDto)
  laborCompositionList?: LaborCompositionDto[];

  @ApiProperty({ type: [PrizePerRangeDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrizePerRangeDto)
  prizesPerRange?: PrizePerRangeDto[];

  @ApiProperty({ type: [PrizePerProductivityDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrizePerProductivityDto)
  prizesPerProductivity?: PrizePerProductivityDto[];
}

class MoveMacrostepOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  macrostepId: string;

  @ApiProperty()
  @IsNumber()
  newIndex: number;
}

// DTO para import de macrosteps em massa
class ImportActivityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalMeasurementExpected?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  measurementUnit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  expectedCost?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  trackingValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  trackingUnit?: string;

  @ApiProperty({ type: [Object], required: false })
  @IsOptional()
  @IsArray()
  laborCompositionList?: any[];

  @ApiProperty({ type: [Object], required: false })
  @IsOptional()
  @IsArray()
  prizesPerRange?: any[];

  @ApiProperty({ type: [Object], required: false })
  @IsOptional()
  @IsArray()
  prizesPerProductivity?: any[];
}

class ImportMacrostepDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [ImportActivityDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportActivityDto)
  activities?: ImportActivityDto[];
}

class ImportMacrostepsBodyDto {
  @ApiProperty({ type: [ImportMacrostepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportMacrostepDto)
  macrosteps: ImportMacrostepDto[];
}

@ApiTags("project-planning")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProjectPlanningController {
  constructor(
    @Inject(ProjectPlanningRepository)
    private readonly repository: ProjectPlanningRepository,
    @Inject(TaskManagerRepository)
    private readonly taskManagerRepository: TaskManagerRepository,
  ) {}

  /**
   * Calcula se a atividade está atrasada baseado na data de término
   */
  private calculateIsDelayed(endDate?: string | null): boolean {
    if (!endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return end < today;
  }

  /**
   * Formata task do TaskManager para o padrão esperado pela Activity
   */
  private formatTaskForActivity(taskManager: {
    id: string;
    gameId: string;
    name: string;
    rewardPoints: number;
    schedule: { startDate: string; endDate: string };
    progressAbsolute: number;
    totalMeasurementExpected?: string | null;
    responsible: { type: string; ids: string[] };
  }) {
    return {
      id: taskManager.id,
      gameId: taskManager.gameId,
      name: taskManager.name,
      points: taskManager.rewardPoints,
      startDate: taskManager.schedule.startDate,
      endDate: taskManager.schedule.endDate,
      progressAbsolute: taskManager.progressAbsolute ?? 0,
      totalMeasurementExpected: taskManager.totalMeasurementExpected
        ? Number(taskManager.totalMeasurementExpected)
        : null,
      responsible: {
        type: taskManager.responsible.type,
        id: taskManager.responsible.ids[0] ?? null,
      },
    };
  }

  /**
   * Formata a resposta de uma activity para o padrão da API original
   */
  private formatActivityResponse(
    activity: {
      id: string;
      organizationId: string;
      projectId: string;
      macrostepId: string;
      name: string;
      description?: string | null;
      totalMeasurementExpected?: string | null;
      measurementUnit?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      duration?: number | null;
      location?: string | null;
      expectedCost?: number | null;
      progressPercent?: number | null;
      trackingValue?: number | null;
      trackingUnit?: string | null;
      laborCompositionList?: unknown[] | null;
      prizesPerRange?: unknown[] | null;
      prizesPerProductivity?: unknown[] | null;
    },
    tasks: Array<{
      id: string;
      gameId: string;
      name: string;
      points: number;
      startDate: string;
      endDate: string;
      progressAbsolute: number;
      totalMeasurementExpected: number | null;
      responsible: { type: string; id: string | null };
    }> = [],
  ) {
    return {
      id: activity.id,
      organizationId: activity.organizationId,
      projectId: activity.projectId,
      macrostepId: activity.macrostepId,
      name: activity.name,
      description: activity.description ?? null,
      totalMeasurementExpected: activity.totalMeasurementExpected
        ? Number(activity.totalMeasurementExpected)
        : null,
      progressPercent: activity.progressPercent ?? 0,
      measurementUnit: activity.measurementUnit ?? null,
      startDate: activity.startDate ?? null,
      endDate: activity.endDate ?? null,
      location: activity.location || null,
      expectedCost: activity.expectedCost ?? null,
      aggregatedCost: 0, // Campo calculado - TODO: implementar cálculo real
      isDelayed: this.calculateIsDelayed(activity.endDate),
      tasks,
      duration: activity.duration ?? null,
      trackingValue: activity.trackingValue ?? null,
      trackingUnit: activity.trackingUnit ?? null,
      laborCompositionList: activity.laborCompositionList ?? [],
      prizesPerRange: activity.prizesPerRange ?? [],
      prizesPerProductivity: activity.prizesPerProductivity ?? [],
    };
  }

  // ========== Macrostep Routes ==========

  @Post("organization/:organizationId/project/:projectId/macrostep")
  async createMacrostep(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Body() body: CreateMacrostepDto,
  ) {
    const macrostepId = body.id || randomUUID();

    // Get or create macrostep order
    let order = await this.repository.getMacrostepOrder(projectId);
    if (!order) {
      order = await this.repository.upsertMacrostepOrder({
        projectId,
        organizationId,
        macrostepIds: [],
      });
    }

    // Create macrostep
    const macrostep = await this.repository.createMacrostep({
      id: macrostepId,
      organizationId,
      projectId,
      name: body.name,
      progressPercent: 0,
    });

    // Update order
    order.macrostepIds.push(macrostepId);
    await this.repository.upsertMacrostepOrder({
      ...order,
    });

    return {
      id: macrostep.id,
      organizationId: macrostep.organizationId,
      projectId: macrostep.projectId,
      name: macrostep.name,
      progressPercent: macrostep.progressPercent,
      activities: [],
    };
  }

  @Put("organization/:organizationId/project/:projectId/macrostep/:macrostepId")
  async updateMacrostep(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("macrostepId") macrostepId: string,
    @Body() body: UpdateMacrostepDto,
  ) {
    const macrostep = await this.repository.getMacrostepById(
      projectId,
      macrostepId,
    );
    if (!macrostep) {
      throw new NotFoundException("Macrostep not found");
    }

    if (macrostep.organizationId !== organizationId) {
      throw new NotFoundException("Macrostep not found");
    }

    const updated = await this.repository.updateMacrostep(
      projectId,
      macrostepId,
      {
        name: body.name,
      },
    );

    const activities =
      await this.repository.listActivitiesByMacrostep(macrostepId);

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      projectId: updated.projectId,
      name: updated.name,
      progressPercent: updated.progressPercent,
      activities: activities.map((a) => ({
        id: a.id,
        name: a.name,
        progressPercent: a.progressPercent,
      })),
    };
  }

  @Delete(
    "organization/:organizationId/project/:projectId/macrostep/:macrostepId",
  )
  @HttpCode(204)
  async deleteMacrostep(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("macrostepId") macrostepId: string,
  ) {
    const macrostep = await this.repository.getMacrostepById(
      projectId,
      macrostepId,
    );
    if (!macrostep) {
      throw new NotFoundException("Macrostep not found");
    }

    if (macrostep.organizationId !== organizationId) {
      throw new NotFoundException("Macrostep not found");
    }

    // Remove from order
    const order = await this.repository.getMacrostepOrder(projectId);
    if (order) {
      order.macrostepIds = order.macrostepIds.filter(
        (id) => id !== macrostepId,
      );
      await this.repository.upsertMacrostepOrder({
        ...order,
      });
    }

    await this.repository.deleteMacrostep(projectId, macrostepId);

    return {};
  }

  @Get("organization/:organizationId/project/:projectId/macrostep")
  async listMacrosteps(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
  ) {
    const macrosteps = await this.repository.listMacrostepsByProject(projectId);
    const order = await this.repository.getMacrostepOrder(projectId);

    // Verify organization
    for (const m of macrosteps) {
      if (m.organizationId !== organizationId) {
        throw new NotFoundException("Macrostep not found");
      }
    }

    // Sort by order
    const orderedMacrosteps = order
      ? order.macrostepIds
          .map((id) => macrosteps.find((m) => m.id === id))
          .filter((m) => m !== undefined)
      : macrosteps;

    // Enrich with activity data
    const enriched = await Promise.all(
      orderedMacrosteps.map(async (macrostep) => {
        if (!macrostep) return null;

        const activities = await this.repository.listActivitiesByMacrostep(
          macrostep.id,
        );

        const expectedCost = activities.reduce(
          (sum, a) => sum + (a.expectedCost || 0),
          0,
        );

        const delayedActivitiesCount = activities.filter((a) => {
          if (!a.endDate) return false;
          const endDate = new Date(a.endDate);
          const now = new Date();
          return now > endDate && (a.progressPercent || 0) < 100;
        }).length;

        const sortedByStartDate = [...activities].sort((a, b) => {
          if (!a.startDate || !b.startDate) return 0;
          return (
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
        });

        const sortedByEndDate = [...activities].sort((a, b) => {
          if (!a.endDate || !b.endDate) return 0;
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        });

        return {
          id: macrostep.id,
          organizationId: macrostep.organizationId,
          projectId: macrostep.projectId,
          name: macrostep.name,
          startDate: sortedByStartDate[0]?.startDate,
          endDate: sortedByEndDate[0]?.endDate,
          expectedCost,
          delayedActivitiesCount,
          progressPercent: Math.min(
            100,
            Math.round(macrostep.progressPercent || 0),
          ),
        };
      }),
    );

    return { macrosteps: enriched.filter((m) => m !== null) };
  }

  @Post("organization/:organizationId/project/:projectId/macrostep/move-order")
  async moveMacrostepOrder(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Body() body: MoveMacrostepOrderDto,
  ) {
    const order = await this.repository.getMacrostepOrder(projectId);
    if (!order) {
      throw new NotFoundException("Macrostep order not found");
    }

    if (order.organizationId !== organizationId) {
      throw new NotFoundException("Macrostep order not found");
    }

    const oldIndex = order.macrostepIds.indexOf(body.macrostepId);
    if (oldIndex === -1) {
      throw new BadRequestException("Macrostep not found in order");
    }

    // Move element
    order.macrostepIds.splice(oldIndex, 1);
    order.macrostepIds.splice(body.newIndex, 0, body.macrostepId);

    await this.repository.upsertMacrostepOrder({
      ...order,
    });

    return {};
  }

  @Post("organization/:organizationId/project/:projectId/macrostep/import")
  async importMacrosteps(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Body() body: ImportMacrostepsBodyDto,
  ) {
    const success: Array<{
      id: string;
      name: string;
      activitiesCount: number;
    }> = [];
    const duplicates: Array<{ name: string; reason: string }> = [];

    // Carregar macrosteps existentes para verificar duplicatas
    const existingMacrosteps =
      await this.repository.listMacrostepsByProject(projectId);
    const existingNames = new Set(
      existingMacrosteps.map((m) => m.name.toLowerCase()),
    );

    // Get or create macrostep order
    let order = await this.repository.getMacrostepOrder(projectId);
    if (!order) {
      order = await this.repository.upsertMacrostepOrder({
        projectId,
        organizationId,
        macrostepIds: [],
      });
    }

    for (const macrostepData of body.macrosteps) {
      // Verificar duplicata por nome (case-insensitive)
      if (existingNames.has(macrostepData.name.toLowerCase())) {
        duplicates.push({
          name: macrostepData.name,
          reason: "Macrostep with this name already exists",
        });
        continue;
      }

      // Criar macrostep
      const macrostepId = randomUUID();
      const macrostep = await this.repository.createMacrostep({
        id: macrostepId,
        organizationId,
        projectId,
        name: macrostepData.name,
        progressPercent: 0,
      });

      // Adicionar ao order
      order.macrostepIds.push(macrostepId);

      // Criar activities se existirem
      let activitiesCount = 0;
      if (macrostepData.activities && macrostepData.activities.length > 0) {
        for (const activityData of macrostepData.activities) {
          await this.repository.createActivity({
            id: randomUUID(),
            organizationId,
            projectId,
            macrostepId,
            name: activityData.name,
            description: activityData.description,
            totalMeasurementExpected:
              activityData.totalMeasurementExpected?.toString(),
            measurementUnit: activityData.measurementUnit,
            startDate: activityData.startDate,
            endDate: activityData.endDate,
            duration: activityData.duration,
            location: activityData.location,
            expectedCost: activityData.expectedCost,
            progressPercent: 0,
            trackingValue: activityData.trackingValue,
            trackingUnit: activityData.trackingUnit,
            laborCompositionList: activityData.laborCompositionList,
            prizesPerRange: activityData.prizesPerRange,
            prizesPerProductivity: activityData.prizesPerProductivity,
          });
          activitiesCount++;
        }
      }

      success.push({
        id: macrostep.id,
        name: macrostep.name,
        activitiesCount,
      });

      // Marcar como existente para evitar duplicatas no mesmo batch
      existingNames.add(macrostepData.name.toLowerCase());
    }

    // Atualizar order
    await this.repository.upsertMacrostepOrder({
      ...order,
    });

    return {
      success,
      duplicates,
      summary: {
        total: body.macrosteps.length,
        imported: success.length,
        duplicated: duplicates.length,
      },
    };
  }

  // ========== Activity Routes ==========

  @Post(
    "organization/:organizationId/project/:projectId/macrostep/:macrostepId/activities",
  )
  async createActivity(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("macrostepId") macrostepId: string,
    @Body() body: CreateActivityDto,
  ) {
    const macrostep = await this.repository.getMacrostepById(
      projectId,
      macrostepId,
    );
    if (!macrostep) {
      throw new NotFoundException("Macrostep not found");
    }

    if (macrostep.organizationId !== organizationId) {
      throw new NotFoundException("Macrostep not found");
    }

    const activity = await this.repository.createActivity({
      id: randomUUID(),
      organizationId,
      projectId,
      macrostepId,
      name: body.name,
      description: body.description,
      totalMeasurementExpected: body.totalMeasurementExpected,
      measurementUnit: body.measurementUnit,
      startDate: body.startDate,
      endDate: body.endDate,
      duration: body.duration,
      location: body.location,
      expectedCost: body.expectedCost,
      progressPercent: 0,
      trackingValue: body.trackingValue,
      trackingUnit: body.trackingUnit,
      laborCompositionList: body.laborCompositionList,
      prizesPerRange: body.prizesPerRange,
      prizesPerProductivity: body.prizesPerProductivity,
    });

    // Update macrostep progress using domain use case
    const activities =
      await this.repository.listActivitiesByMacrostep(macrostepId);
    const { progressPercent: newProgress } = calculateMacrostepProgress({
      activities,
    });
    await this.repository.updateMacrostep(projectId, macrostepId, {
      progressPercent: newProgress,
    });

    return this.formatActivityResponse(activity);
  }

  @Put(
    "organization/:organizationId/project/:projectId/macrostep/:macrostepId/activities/:activityId",
  )
  async updateActivity(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("macrostepId") macrostepId: string,
    @Param("activityId") activityId: string,
    @Body() body: UpdateActivityDto,
  ) {
    const activity = await this.repository.getActivityById(
      macrostepId,
      activityId,
    );
    if (!activity) {
      throw new NotFoundException("Activity not found");
    }

    if (activity.organizationId !== organizationId) {
      throw new NotFoundException("Activity not found");
    }

    const updated = await this.repository.updateActivity(
      macrostepId,
      activityId,
      {
        ...body,
      },
    );

    // Update macrostep progress using domain use case
    const activities =
      await this.repository.listActivitiesByMacrostep(macrostepId);
    const { progressPercent: newProgress } = calculateMacrostepProgress({
      activities,
    });
    await this.repository.updateMacrostep(projectId, macrostepId, {
      progressPercent: newProgress,
    });

    return this.formatActivityResponse(updated);
  }

  @Delete(
    "organization/:organizationId/project/:projectId/macrostep/:macrostepId/activities/:activityId",
  )
  @HttpCode(204)
  async deleteActivity(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("macrostepId") macrostepId: string,
    @Param("activityId") activityId: string,
  ) {
    const activity = await this.repository.getActivityById(
      macrostepId,
      activityId,
    );
    if (!activity) {
      throw new NotFoundException("Activity not found");
    }

    if (activity.organizationId !== organizationId) {
      throw new NotFoundException("Activity not found");
    }

    await this.repository.deleteActivity(macrostepId, activityId);

    // Update macrostep progress using domain use case
    const activities =
      await this.repository.listActivitiesByMacrostep(macrostepId);
    const { progressPercent: newProgress } = calculateMacrostepProgress({
      activities,
    });
    await this.repository.updateMacrostep(projectId, macrostepId, {
      progressPercent: newProgress,
    });

    return {};
  }

  @Get(
    "organization/:organizationId/project/:projectId/macrostep/:macrostepId/activities",
  )
  async listActivities(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("macrostepId") macrostepId: string,
  ) {
    const macrostep = await this.repository.getMacrostepById(
      projectId,
      macrostepId,
    );
    if (!macrostep) {
      throw new NotFoundException("Macrostep not found");
    }

    if (macrostep.organizationId !== organizationId) {
      throw new NotFoundException("Macrostep not found");
    }

    const activities =
      await this.repository.listActivitiesByMacrostep(macrostepId);

    // Busca tasks associadas a cada activity via TaskManager
    const activitiesWithTasks = await Promise.all(
      activities.map(async (activity) => {
        const taskManagers = await this.taskManagerRepository.listByActivityId(
          activity.id,
        );

        const tasks = taskManagers.map((tm) => this.formatTaskForActivity(tm));

        return this.formatActivityResponse(activity, tasks);
      }),
    );

    return {
      activities: activitiesWithTasks,
    };
  }

  // Alias route for frontend compatibility (activity without 's')
  @Get(
    "organization/:organizationId/project/:projectId/macrostep/:macrostepId/activity",
  )
  async listActivitiesAlias(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("macrostepId") macrostepId: string,
  ) {
    return this.listActivities(organizationId, projectId, macrostepId);
  }

  // POST alias for frontend compatibility (activity without 's')
  @Post(
    "organization/:organizationId/project/:projectId/macrostep/:macrostepId/activity",
  )
  async createActivityAlias(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("macrostepId") macrostepId: string,
    @Body() body: CreateActivityDto,
  ) {
    return this.createActivity(organizationId, projectId, macrostepId, body);
  }

  // PUT alias for frontend compatibility (activity without 's')
  @Put(
    "organization/:organizationId/project/:projectId/macrostep/:macrostepId/activity/:activityId",
  )
  async updateActivityAlias(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("macrostepId") macrostepId: string,
    @Param("activityId") activityId: string,
    @Body() body: UpdateActivityDto,
  ) {
    return this.updateActivity(
      organizationId,
      projectId,
      macrostepId,
      activityId,
      body,
    );
  }

  // DELETE alias for frontend compatibility (activity without 's')
  @Delete(
    "organization/:organizationId/project/:projectId/macrostep/:macrostepId/activity/:activityId",
  )
  @HttpCode(204)
  async deleteActivityAlias(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("macrostepId") macrostepId: string,
    @Param("activityId") activityId: string,
  ) {
    return this.deleteActivity(
      organizationId,
      projectId,
      macrostepId,
      activityId,
    );
  }

  // TODO: Export report endpoint - implementar quando necessário
  @Get(
    "organization/:organizationId/project/:projectId/macrostep/export-report",
  )
  async exportReport(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
  ) {
    // Placeholder para futura implementação de exportação de relatórios
    throw new Error("Export report not implemented yet");
  }
}
