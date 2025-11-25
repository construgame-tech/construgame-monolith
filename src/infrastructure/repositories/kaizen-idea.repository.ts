import type { KaizenIdeaEntity } from "@domain/kaizen-idea/entities/kaizen-idea.entity";
import type { IKaizenIdeaRepository } from "@domain/kaizen-idea/repositories/kaizen-idea.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { kaizenIdeas } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

@Injectable()
export class KaizenIdeaRepository implements IKaizenIdeaRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(idea: KaizenIdeaEntity): Promise<void> {
    await this.db
      .insert(kaizenIdeas)
      .values({
        id: idea.id,
        organizationId: idea.organizationId,
        projectId: idea.projectId,
        gameId: idea.gameId,
        kaizenTypeId: idea.kaizenTypeId,
        status: idea.status,
        name: idea.name,
        isRecommended: idea.isRecommended,
        authors: idea.authors,
        problem: idea.problem,
        solution: idea.solution,
        tasks: idea.tasks,
        benefits: idea.benefits,
        attachments: idea.attachments,
        createdDate: idea.createdDate,
        updatedDate: idea.updatedDate,
        sequence: idea.sequence,
        executableKaizenProjectIds: idea.executableKaizenProjectIds,
        nonExecutableProjects: idea.nonExecutableProjects,
      })
      .onConflictDoUpdate({
        target: kaizenIdeas.id,
        set: {
          projectId: idea.projectId,
          gameId: idea.gameId,
          kaizenTypeId: idea.kaizenTypeId,
          status: idea.status,
          name: idea.name,
          isRecommended: idea.isRecommended,
          authors: idea.authors,
          problem: idea.problem,
          solution: idea.solution,
          tasks: idea.tasks,
          benefits: idea.benefits,
          attachments: idea.attachments,
          updatedDate: idea.updatedDate,
          sequence: idea.sequence,
          executableKaizenProjectIds: idea.executableKaizenProjectIds,
          nonExecutableProjects: idea.nonExecutableProjects,
        },
      });
  }

  async delete(organizationId: string, ideaId: string): Promise<void> {
    await this.db
      .delete(kaizenIdeas)
      .where(
        and(
          eq(kaizenIdeas.id, ideaId),
          eq(kaizenIdeas.organizationId, organizationId),
        ),
      );
  }

  async findById(
    organizationId: string,
    ideaId: string,
  ): Promise<KaizenIdeaEntity | null> {
    const result = await this.db
      .select()
      .from(kaizenIdeas)
      .where(
        and(
          eq(kaizenIdeas.id, ideaId),
          eq(kaizenIdeas.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<KaizenIdeaEntity[]> {
    const result = await this.db
      .select()
      .from(kaizenIdeas)
      .where(eq(kaizenIdeas.organizationId, organizationId));

    return result.map(this.mapToEntity);
  }

  private mapToEntity(row: typeof kaizenIdeas.$inferSelect): KaizenIdeaEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      projectId: row.projectId ?? undefined,
      gameId: row.gameId ?? undefined,
      kaizenTypeId: row.kaizenTypeId ?? undefined,
      status: row.status,
      name: row.name,
      isRecommended: row.isRecommended ?? undefined,
      authors: row.authors ?? undefined,
      problem: row.problem ?? undefined,
      solution: row.solution ?? undefined,
      tasks: row.tasks ?? undefined,
      benefits: row.benefits ?? undefined,
      attachments: row.attachments ?? undefined,
      createdDate: row.createdDate,
      updatedDate: row.updatedDate ?? undefined,
      sequence: row.sequence,
      executableKaizenProjectIds: row.executableKaizenProjectIds ?? undefined,
      nonExecutableProjects: row.nonExecutableProjects ?? undefined,
    };
  }
}
