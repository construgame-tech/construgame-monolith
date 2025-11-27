import { ProjectEntity } from "@domain/project/entities/project.entity";
import { IProjectRepository } from "@domain/project/repositories/project.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "../database/drizzle.provider";
import { projects } from "../database/schemas/project.schema";

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  async save(project: ProjectEntity): Promise<void> {
    const projectData = {
      id: project.id,
      organizationId: project.organizationId,
      name: project.name,
      responsibles: project.responsibles || null,
      status: project.status,
      activeGameId: project.activeGameId || null,
      photo: project.photo || null,
      type: project.type || null,
      state: project.state || null,
      city: project.city || null,
      startDate: project.startDate || null,
      endDate: project.endDate || null,
      prizes: project.prizes || null,
      teams: project.teams || null,
    };

    await this.db.insert(projects).values(projectData).onConflictDoUpdate({
      target: projects.id,
      set: projectData,
    });
  }

  async delete(organizationId: string, projectId: string): Promise<void> {
    await this.db
      .delete(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.organizationId, organizationId),
        ),
      );
  }

  async findById(
    organizationId: string,
    projectId: string,
  ): Promise<ProjectEntity | null> {
    const result = await this.db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByOrganizationId(organizationId: string): Promise<ProjectEntity[]> {
    const result = await this.db
      .select()
      .from(projects)
      .where(eq(projects.organizationId, organizationId));

    return result.map(this.mapToEntity);
  }

  private mapToEntity(row: typeof projects.$inferSelect): ProjectEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      responsibles: row.responsibles || undefined,
      status: row.status,
      activeGameId: row.activeGameId || undefined,
      photo: row.photo || undefined,
      type: row.type || undefined,
      state: row.state || undefined,
      city: row.city || undefined,
      startDate: row.startDate || undefined,
      endDate: row.endDate || undefined,
      prizes: row.prizes || undefined,
      teams: row.teams || undefined,
    };
  }
}
