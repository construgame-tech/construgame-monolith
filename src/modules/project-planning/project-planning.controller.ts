import { randomUUID } from "node:crypto";
import { ProjectPlanningRepository } from "@infrastructure/repositories/project-planning.repository";
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

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  unitCost: number;
}

class PrizePerRangeDto {
  @ApiProperty()
  @IsNumber()
  min: number;

  @ApiProperty()
  @IsNumber()
  max: number;

  @ApiProperty()
  @IsNumber()
  points: number;
}

class PrizePerProductivityDto {
  @ApiProperty()
  @IsNumber()
  productivity: number;

  @ApiProperty()
  @IsNumber()
  points: number;
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
  ) {}

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
        sequence: 0,
      });
    }

    // Create macrostep
    const macrostep = await this.repository.createMacrostep({
      id: macrostepId,
      organizationId,
      projectId,
      name: body.name,
      progressPercent: 0,
      sequence: 0,
    });

    // Update order
    order.macrostepIds.push(macrostepId);
    await this.repository.upsertMacrostepOrder({
      ...order,
      sequence: order.sequence + 1,
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

  @Put(
    "organization/:organizationId/project/:projectId/macrostep/:macrostepId",
  )
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
        sequence: macrostep.sequence + 1,
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
        sequence: order.sequence + 1,
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

  @Post(
    "organization/:organizationId/project/:projectId/macrostep/move-order",
  )
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
      sequence: order.sequence + 1,
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
        sequence: 0,
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
        sequence: 0,
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
            sequence: 0,
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
      sequence: order.sequence + 1,
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
      sequence: 0,
    });

    // Update macrostep progress
    const activities =
      await this.repository.listActivitiesByMacrostep(macrostepId);
    const newProgress = this.repository.calculateMacrostepProgress(activities);
    await this.repository.updateMacrostep(projectId, macrostepId, {
      progressPercent: newProgress,
      sequence: macrostep.sequence + 1,
    });

    return {
      projectId: activity.projectId,
      organizationId: activity.organizationId,
      macrostepId: activity.macrostepId,
      id: activity.id,
      name: activity.name,
      description: activity.description,
      totalMeasurementExpected: activity.totalMeasurementExpected,
      measurementUnit: activity.measurementUnit,
      startDate: activity.startDate,
      endDate: activity.endDate,
      duration: activity.duration,
      location: activity.location,
      expectedCost: activity.expectedCost,
      progressPercent: activity.progressPercent,
      tasks: [],
      trackingValue: activity.trackingValue,
      trackingUnit: activity.trackingUnit,
      laborCompositionList: activity.laborCompositionList,
      prizesPerRange: activity.prizesPerRange,
      prizesPerProductivity: activity.prizesPerProductivity,
    };
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
        sequence: activity.sequence + 1,
      },
    );

    // Update macrostep progress
    const macrostep = await this.repository.getMacrostepById(
      projectId,
      macrostepId,
    );
    const activities =
      await this.repository.listActivitiesByMacrostep(macrostepId);
    const newProgress = this.repository.calculateMacrostepProgress(activities);
    await this.repository.updateMacrostep(projectId, macrostepId, {
      progressPercent: newProgress,
      sequence: macrostep.sequence + 1,
    });

    return {
      projectId: updated.projectId,
      organizationId: updated.organizationId,
      macrostepId: updated.macrostepId,
      id: updated.id,
      name: updated.name,
      description: updated.description,
      totalMeasurementExpected: updated.totalMeasurementExpected,
      measurementUnit: updated.measurementUnit,
      startDate: updated.startDate,
      endDate: updated.endDate,
      duration: updated.duration,
      location: updated.location,
      expectedCost: updated.expectedCost,
      progressPercent: updated.progressPercent,
      trackingValue: updated.trackingValue,
      trackingUnit: updated.trackingUnit,
      laborCompositionList: updated.laborCompositionList,
      prizesPerRange: updated.prizesPerRange,
      prizesPerProductivity: updated.prizesPerProductivity,
    };
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

    // Update macrostep progress
    const macrostep = await this.repository.getMacrostepById(
      projectId,
      macrostepId,
    );
    const activities =
      await this.repository.listActivitiesByMacrostep(macrostepId);
    const newProgress = this.repository.calculateMacrostepProgress(activities);
    await this.repository.updateMacrostep(projectId, macrostepId, {
      progressPercent: newProgress,
      sequence: macrostep.sequence + 1,
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

    return {
      activities: activities.map((a) => ({
        projectId: a.projectId,
        organizationId: a.organizationId,
        macrostepId: a.macrostepId,
        id: a.id,
        name: a.name,
        description: a.description,
        totalMeasurementExpected: a.totalMeasurementExpected,
        measurementUnit: a.measurementUnit,
        startDate: a.startDate,
        endDate: a.endDate,
        duration: a.duration,
        location: a.location,
        expectedCost: a.expectedCost,
        progressPercent: a.progressPercent,
        trackingValue: a.trackingValue,
        trackingUnit: a.trackingUnit,
        laborCompositionList: a.laborCompositionList,
        prizesPerRange: a.prizesPerRange,
        prizesPerProductivity: a.prizesPerProductivity,
      })),
    };
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
