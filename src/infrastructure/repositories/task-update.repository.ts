import type {
  TaskUpdateEntity,
  TaskUpdateStatus,
} from "@domain/task-update/entities/task-update.entity";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import {
  games,
  projects,
  taskUpdates,
  tasks,
  teams,
  users,
} from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// Tipo para retorno enriquecido da listagem
export interface TaskUpdateEnriched {
  id: string;
  project: {
    id: string;
    name: string;
  };
  game: {
    id: string;
    name: string;
  };
  team: {
    id: string | null;
    name: string | null;
  };
  task: {
    id: string;
    name: string;
    progressAbsolute: number;
    startDate: string | null;
    endDate: string | null;
    kpiId: string | null;
    location: string | null;
  };
  startDate: string | null;
  endDate: string | null;
  reviewNote: string | null;
  photos: string[];
  participants: string[];
  status: string;
  progress: {
    totalMeasurementExpected: string | null;
    measurementUnit: string | null;
    absolute: number | null;
    hours: number | null;
    note: string | null;
    percent: number | null;
    updatedAt: string | null;
  };
  submitter: {
    id: string;
    name: string;
    photo: string | null;
  };
  reviewer: {
    id: string | null;
    name: string | null;
    photo: string | null;
  };
  checklist: Array<{
    id?: string;
    label: string;
    checked: boolean;
  }>;
  files: Array<{
    name: string;
    size: number;
    url: string;
    filetype: string;
    createdAt: string;
  }>;
}

@Injectable()
export class TaskUpdateRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(entity: TaskUpdateEntity): Promise<TaskUpdateEntity> {
    const [result] = await this.db
      .insert(taskUpdates)
      .values({
        id: entity.id,
        gameId: entity.gameId,
        taskId: entity.taskId,
        status: entity.status,
        submittedBy: entity.submittedBy,
        reviewedBy: entity.reviwedBy,
        reviewNote: entity.reviewNote,
        startDate: entity.startDate?.toISOString().split("T")[0],
        endDate: entity.endDate?.toISOString().split("T")[0],
        participants: entity.participants,
        photos: entity.photos,
        progress: entity.progress as any,
        checklist: entity.checklist,
        files: entity.files,
      })
      .onConflictDoUpdate({
        target: taskUpdates.id,
        set: {
          status: entity.status,
          reviewedBy: entity.reviwedBy,
          reviewNote: entity.reviewNote,
          startDate: entity.startDate?.toISOString().split("T")[0],
          endDate: entity.endDate?.toISOString().split("T")[0],
          participants: entity.participants,
          photos: entity.photos,
          progress: entity.progress as any,
          checklist: entity.checklist,
          files: entity.files,
        },
      })
      .returning();

    return this.mapToEntity(result);
  }

  async findById(id: string): Promise<TaskUpdateEntity | null> {
    const [result] = await this.db
      .select()
      .from(taskUpdates)
      .where(eq(taskUpdates.id, id));

    return result ? this.mapToEntity(result) : null;
  }

  async findByTaskId(taskId: string): Promise<TaskUpdateEntity[]> {
    const results = await this.db
      .select()
      .from(taskUpdates)
      .where(eq(taskUpdates.taskId, taskId));

    return results.map((r) => this.mapToEntity(r));
  }

  async findByGameId(gameId: string): Promise<TaskUpdateEntity[]> {
    const results = await this.db
      .select()
      .from(taskUpdates)
      .where(eq(taskUpdates.gameId, gameId));

    return results.map((r) => this.mapToEntity(r));
  }

  async findByStatus(
    gameId: string,
    status: TaskUpdateStatus,
  ): Promise<TaskUpdateEntity[]> {
    const results = await this.db
      .select()
      .from(taskUpdates)
      .where(
        and(eq(taskUpdates.gameId, gameId), eq(taskUpdates.status, status)),
      );

    return results.map((r) => this.mapToEntity(r));
  }

  async findBySubmitterId(submitterId: string): Promise<TaskUpdateEntity[]> {
    const results = await this.db
      .select()
      .from(taskUpdates)
      .where(eq(taskUpdates.submittedBy, submitterId));

    return results.map((r) => this.mapToEntity(r));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(taskUpdates).where(eq(taskUpdates.id, id));
  }

  async findByOrganizationId(
    organizationId: string,
    filters?: {
      status?: TaskUpdateStatus;
      submittedBy?: string;
      taskId?: string;
      teamId?: string;
      gameId?: string;
      kpiId?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ items: TaskUpdateEnriched[]; total: number }> {
    // Alias para diferenciar submitter e reviewer
    const submitter = alias(users, "submitter");
    const reviewer = alias(users, "reviewer");

    // Build conditions
    const conditions = [eq(games.organizationId, organizationId)];

    if (filters?.status) {
      conditions.push(eq(taskUpdates.status, filters.status));
    }
    if (filters?.submittedBy) {
      conditions.push(eq(taskUpdates.submittedBy, filters.submittedBy));
    }
    if (filters?.taskId) {
      conditions.push(eq(taskUpdates.taskId, filters.taskId));
    }
    if (filters?.gameId) {
      conditions.push(eq(taskUpdates.gameId, filters.gameId));
    }
    if (filters?.teamId) {
      conditions.push(eq(tasks.teamId, filters.teamId));
    }
    if (filters?.kpiId) {
      conditions.push(eq(tasks.kpiId, filters.kpiId));
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;

    // Get results with all joins
    const results = await this.db
      .select({
        taskUpdate: taskUpdates,
        game: {
          id: games.id,
          name: games.name,
          projectId: games.projectId,
        },
        project: {
          id: projects.id,
          name: projects.name,
        },
        task: {
          id: tasks.id,
          name: tasks.name,
          startDate: tasks.startDate,
          endDate: tasks.endDate,
          kpiId: tasks.kpiId,
          location: tasks.location,
          teamId: tasks.teamId,
          measurementUnit: tasks.measurementUnit,
          totalMeasurementExpected: tasks.totalMeasurementExpected,
          progress: tasks.progress,
          checklist: tasks.checklist,
        },
        team: {
          id: teams.id,
          name: teams.name,
        },
        submitter: {
          id: submitter.id,
          name: submitter.name,
          photo: submitter.photo,
        },
        reviewer: {
          id: reviewer.id,
          name: reviewer.name,
          photo: reviewer.photo,
        },
      })
      .from(taskUpdates)
      .innerJoin(games, eq(taskUpdates.gameId, games.id))
      .innerJoin(projects, eq(games.projectId, projects.id))
      .innerJoin(tasks, eq(taskUpdates.taskId, tasks.id))
      .leftJoin(teams, eq(tasks.teamId, teams.id))
      .innerJoin(submitter, eq(taskUpdates.submittedBy, submitter.id))
      .leftJoin(reviewer, eq(taskUpdates.reviewedBy, reviewer.id))
      .where(and(...conditions))
      .orderBy(sql`${taskUpdates.id} DESC`)
      .limit(limit)
      .offset(offset);

    // Count total
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(taskUpdates)
      .innerJoin(games, eq(taskUpdates.gameId, games.id))
      .innerJoin(tasks, eq(taskUpdates.taskId, tasks.id))
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Map results to enriched format
    const items: TaskUpdateEnriched[] = results.map((r) => {
      const taskProgress = r.task.progress as {
        absolute?: number;
        percent?: number;
        updatedAt?: string;
      } | null;

      const updateProgress = r.taskUpdate.progress as {
        absolute?: number;
        percent?: number;
        hours?: number;
        note?: string;
        updatedAt?: string;
      } | null;

      // Calcular percent dinamicamente se não estiver definido mas temos absolute e totalMeasurementExpected
      let calculatedPercent = updateProgress?.percent || null;
      if (
        calculatedPercent === null &&
        updateProgress?.absolute !== undefined &&
        updateProgress?.absolute !== null &&
        r.task.totalMeasurementExpected
      ) {
        const total = Number(r.task.totalMeasurementExpected);
        if (total > 0) {
          calculatedPercent = Math.round((updateProgress.absolute / total) * 100);
        }
      }

      // Para checklist, precisamos buscar o label da task original
      const updateChecklist = (r.taskUpdate.checklist as Array<{ id: string; checked: boolean }>) || [];
      const taskOriginalChecklist = (r.task.checklist as Array<{ id: string; label: string; checked: boolean }>) || [];

      // Mapear checklist para incluir label
      let enrichedChecklist: Array<{ id?: string; label: string; checked: boolean }> = [];
      
      if (updateChecklist.length > 0 && taskOriginalChecklist.length > 0) {
        const checklistMap = new Map<string, string>();
        for (const item of taskOriginalChecklist) {
          checklistMap.set(item.id, item.label);
        }
        enrichedChecklist = updateChecklist.map((item) => ({
          id: item.id,
          label: checklistMap.get(item.id) || "",
          checked: item.checked,
        }));
      }

      return {
        id: r.taskUpdate.id,
        project: {
          id: r.project.id,
          name: r.project.name,
        },
        game: {
          id: r.game.id,
          name: r.game.name,
        },
        team: {
          id: r.team?.id || null,
          name: r.team?.name || null,
        },
        task: {
          id: r.task.id,
          name: r.task.name,
          progressAbsolute: taskProgress?.absolute || 0,
          startDate: r.task.startDate,
          endDate: r.task.endDate,
          kpiId: r.task.kpiId,
          location: r.task.location,
        },
        startDate: r.taskUpdate.startDate,
        endDate: r.taskUpdate.endDate,
        reviewNote: r.taskUpdate.reviewNote,
        photos: (r.taskUpdate.photos as string[]) || [],
        participants: (r.taskUpdate.participants as string[]) || [],
        status: r.taskUpdate.status,
        progress: {
          totalMeasurementExpected: r.task.totalMeasurementExpected,
          measurementUnit: r.task.measurementUnit,
          absolute: updateProgress?.absolute || null,
          hours: updateProgress?.hours || null,
          note: updateProgress?.note || null,
          percent: calculatedPercent,
          updatedAt: updateProgress?.updatedAt || null,
        },
        submitter: {
          id: r.submitter.id,
          name: r.submitter.name,
          photo: r.submitter.photo,
        },
        reviewer: {
          id: r.reviewer?.id || null,
          name: r.reviewer?.name || null,
          photo: r.reviewer?.photo || null,
        },
        checklist: enrichedChecklist,
        files: (r.taskUpdate.files as TaskUpdateEnriched["files"]) || [],
      };
    });

    return { items, total };
  }

  private mapToEntity(row: typeof taskUpdates.$inferSelect): TaskUpdateEntity {
    return {
      id: row.id,
      gameId: row.gameId,
      taskId: row.taskId,
      status: row.status as TaskUpdateStatus,
      submittedBy: row.submittedBy,
      reviwedBy: row.reviewedBy || undefined,
      reviewNote: row.reviewNote || undefined,
      startDate: row.startDate ? new Date(row.startDate) : undefined,
      endDate: row.endDate ? new Date(row.endDate) : undefined,
      participants: row.participants as string[] | undefined,
      photos: row.photos as string[] | undefined,
      progress: row.progress as any,
      checklist: row.checklist as any,
      files: row.files as any,
    };
  }
}
