import { ProjectPlanningRepository } from "@infrastructure/repositories/project-planning.repository";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { randomUUID } from "crypto";

// DTOs
class CreateMacrostepDto {
  name: string;
  id?: string;
}

class UpdateMacrostepDto {
  name: string;
}

class CreateActivityDto {
  name: string;
  description?: string;
  totalMeasurementExpected?: string;
  measurementUnit?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  location?: string;
  expectedCost?: number;
  trackingValue?: number;
  trackingUnit?: string;
  laborCompositionList?: Array<{
    jobRoleId: string;
    jobRoleName: string;
    quantity: number;
    unitCost: number;
  }>;
  prizesPerRange?: Array<{
    min: number;
    max: number;
    points: number;
  }>;
  prizesPerProductivity?: Array<{
    productivity: number;
    points: number;
  }>;
}

class UpdateActivityDto {
  name?: string;
  description?: string;
  totalMeasurementExpected?: string;
  measurementUnit?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  location?: string;
  expectedCost?: number;
  trackingValue?: number;
  trackingUnit?: string;
  laborCompositionList?: Array<{
    jobRoleId: string;
    jobRoleName: string;
    quantity: number;
    unitCost: number;
  }>;
  prizesPerRange?: Array<{
    min: number;
    max: number;
    points: number;
  }>;
  prizesPerProductivity?: Array<{
    productivity: number;
    points: number;
  }>;
}

class MoveMacrostepOrderDto {
  macrostepId: string;
  newIndex: number;
}

@Controller()
export class ProjectPlanningController {
  constructor(
    @Inject(ProjectPlanningRepository)
    private readonly repository: ProjectPlanningRepository,
  ) {}

  // ========== Macrostep Routes ==========

  @Post("organizations/:organizationId/projects/:projectId/macrosteps")
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
    "organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId",
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
    "organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId",
  )
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

  @Get("organizations/:organizationId/projects/:projectId/macrosteps")
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
    "organizations/:organizationId/projects/:projectId/macrosteps/move-order",
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

  // ========== Activity Routes ==========

  @Post(
    "organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId/activities",
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
    "organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId/activities/:activityId",
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
    "organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId/activities/:activityId",
  )
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
    "organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId/activities",
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
    "organizations/:organizationId/projects/:projectId/macrosteps/export-report",
  )
  async exportReport(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
  ) {
    // Placeholder para futura implementação de exportação de relatórios
    throw new Error("Export report not implemented yet");
  }
}
