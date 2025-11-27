import type { KaizenEntity } from "@domain/kaizen/entities/kaizen.entity";
import type { IKaizenRepository } from "@domain/kaizen/repositories/kaizen.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { kaizens } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

@Injectable()
export class KaizenRepository implements IKaizenRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(kaizen: KaizenEntity): Promise<void> {
    await this.db
      .insert(kaizens)
      .values({
        id: kaizen.id,
        organizationId: kaizen.organizationId,
        projectId: kaizen.projectId,
        gameId: kaizen.gameId,
        status: kaizen.status,
        name: kaizen.name,
        createdDate: kaizen.createdDate,
        updatedDate: kaizen.updatedDate,
        originalKaizenId: kaizen.originalKaizenId,
        leaderId: kaizen.leaderId,
        teamId: kaizen.teamId,
        category: kaizen.category,
        kaizenTypeId: kaizen.kaizenTypeId,
        kaizenIdeaId: kaizen.kaizenIdeaId,
        responsibles: kaizen.responsibles,
        currentSituation: kaizen.currentSituation,
        currentSituationImages: kaizen.currentSituationImages,
        solution: kaizen.solution,
        solutionImages: kaizen.solutionImages,
        tasks: kaizen.tasks,
        benefits: kaizen.benefits,
        resources: kaizen.resources,
        files: kaizen.files,
        attachments: kaizen.attachments,
        replicas: kaizen.replicas,
      })
      .onConflictDoUpdate({
        target: kaizens.id,
        set: {
          status: kaizen.status,
          name: kaizen.name,
          updatedDate: kaizen.updatedDate,
          leaderId: kaizen.leaderId,
          teamId: kaizen.teamId,
          category: kaizen.category,
          kaizenTypeId: kaizen.kaizenTypeId,
          kaizenIdeaId: kaizen.kaizenIdeaId,
          responsibles: kaizen.responsibles,
          currentSituation: kaizen.currentSituation,
          currentSituationImages: kaizen.currentSituationImages,
          solution: kaizen.solution,
          solutionImages: kaizen.solutionImages,
          tasks: kaizen.tasks,
          benefits: kaizen.benefits,
          resources: kaizen.resources,
          files: kaizen.files,
          attachments: kaizen.attachments,
          replicas: kaizen.replicas,
        },
      });
  }

  async saveMultiple(kaizenList: KaizenEntity[]): Promise<void> {
    if (kaizenList.length === 0) return;

    await this.db.transaction(async (tx) => {
      for (const kaizen of kaizenList) {
        await tx
          .insert(kaizens)
          .values({
            id: kaizen.id,
            organizationId: kaizen.organizationId,
            projectId: kaizen.projectId,
            gameId: kaizen.gameId,
            status: kaizen.status,
            name: kaizen.name,
            createdDate: kaizen.createdDate,
            updatedDate: kaizen.updatedDate,
            originalKaizenId: kaizen.originalKaizenId,
            leaderId: kaizen.leaderId,
            teamId: kaizen.teamId,
            category: kaizen.category,
            kaizenTypeId: kaizen.kaizenTypeId,
            kaizenIdeaId: kaizen.kaizenIdeaId,
            responsibles: kaizen.responsibles,
            currentSituation: kaizen.currentSituation,
            currentSituationImages: kaizen.currentSituationImages,
            solution: kaizen.solution,
            solutionImages: kaizen.solutionImages,
            tasks: kaizen.tasks,
            benefits: kaizen.benefits,
            resources: kaizen.resources,
            files: kaizen.files,
            attachments: kaizen.attachments,
            replicas: kaizen.replicas,
          })
          .onConflictDoUpdate({
            target: kaizens.id,
            set: {
              status: kaizen.status,
              name: kaizen.name,
              updatedDate: kaizen.updatedDate,
            },
          });
      }
    });
  }

  async delete(kaizenId: string): Promise<void> {
    await this.db.delete(kaizens).where(eq(kaizens.id, kaizenId));
  }

  async findById(kaizenId: string): Promise<KaizenEntity | null> {
    const result = await this.db
      .select()
      .from(kaizens)
      .where(eq(kaizens.id, kaizenId))
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByIds(kaizenIds: string[]): Promise<KaizenEntity[]> {
    const result = await this.db
      .select()
      .from(kaizens)
      .where(eq(kaizens.id, kaizenIds[0])); // Simple implementation

    return result.map(this.mapToEntity);
  }

  async findByGameId(gameId: string): Promise<KaizenEntity[]> {
    const result = await this.db
      .select()
      .from(kaizens)
      .where(eq(kaizens.gameId, gameId));

    return result.map(this.mapToEntity);
  }

  async findByLeaderId(leaderId: string): Promise<KaizenEntity[]> {
    const result = await this.db
      .select()
      .from(kaizens)
      .where(eq(kaizens.leaderId, leaderId));

    return result.map(this.mapToEntity);
  }

  async findByTeamId(teamId: string): Promise<KaizenEntity[]> {
    const result = await this.db
      .select()
      .from(kaizens)
      .where(eq(kaizens.teamId, teamId));

    return result.map(this.mapToEntity);
  }

  async findByOrganizationId(organizationId: string): Promise<KaizenEntity[]> {
    const result = await this.db
      .select()
      .from(kaizens)
      .where(eq(kaizens.organizationId, organizationId));

    return result.map(this.mapToEntity);
  }

  async findByProjectId(
    organizationId: string,
    projectId: string,
  ): Promise<KaizenEntity[]> {
    const result = await this.db
      .select()
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          eq(kaizens.projectId, projectId),
        ),
      );

    return result.map(this.mapToEntity);
  }

  private mapToEntity(row: typeof kaizens.$inferSelect): KaizenEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      projectId: row.projectId,
      gameId: row.gameId,
      status: row.status,
      name: row.name,
      createdDate: row.createdDate,
      updatedDate: row.updatedDate ?? undefined,
      authorId: row.authorId ?? undefined,
      description: row.description ?? undefined,
      originalKaizenId: row.originalKaizenId ?? undefined,
      leaderId: row.leaderId ?? undefined,
      teamId: row.teamId ?? undefined,
      category: row.category ?? undefined,
      kaizenTypeId: row.kaizenTypeId ?? undefined,
      kaizenIdeaId: row.kaizenIdeaId ?? undefined,
      responsibles: row.responsibles ?? undefined,
      currentSituation: row.currentSituation ?? undefined,
      currentSituationImages: row.currentSituationImages ?? undefined,
      solution: row.solution ?? undefined,
      solutionImages: row.solutionImages ?? undefined,
      tasks: row.tasks ?? undefined,
      benefits: row.benefits ?? undefined,
      resources: row.resources ?? undefined,
      files: row.files ?? undefined,
      attachments: row.attachments ?? undefined,
      replicas: row.replicas ?? undefined,
    };
  }
}
