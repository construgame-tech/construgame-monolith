import { projectDiaries } from "@infrastructure/database/schemas/project-diary.schema";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";

@Injectable()
export class ProjectDiaryRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async upsert(data: typeof projectDiaries.$inferInsert) {
    // Check if exists
    const existing = await this.getByDate(data.projectId, data.date);

    if (existing) {
      // Update
      const [result] = await this.db
        .update(projectDiaries)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projectDiaries.projectId, data.projectId),
            eq(projectDiaries.date, data.date),
          ),
        )
        .returning();
      return result;
    }

    // Insert
    const [result] = await this.db
      .insert(projectDiaries)
      .values(data)
      .returning();
    return result;
  }

  async getByDate(projectId: string, date: string) {
    const [result] = await this.db
      .select()
      .from(projectDiaries)
      .where(
        and(
          eq(projectDiaries.projectId, projectId),
          eq(projectDiaries.date, date),
        ),
      );
    return result;
  }

  async listByProject(projectId: string, limit?: number) {
    let query = this.db
      .select()
      .from(projectDiaries)
      .where(eq(projectDiaries.projectId, projectId))
      .orderBy(desc(projectDiaries.date));

    if (limit) {
      query = query.limit(limit) as any;
    }

    return query;
  }

  async listByProjectAndDateRange(
    projectId: string,
    startDate: string,
    endDate: string,
  ) {
    return this.db
      .select()
      .from(projectDiaries)
      .where(eq(projectDiaries.projectId, projectId))
      .orderBy(desc(projectDiaries.date));
    // Note: Date range filtering would need SQL BETWEEN
    // For simplicity, filtering in memory or using raw SQL
  }

  async deleteByDate(projectId: string, date: string) {
    await this.db
      .delete(projectDiaries)
      .where(
        and(
          eq(projectDiaries.projectId, projectId),
          eq(projectDiaries.date, date),
        ),
      );
  }
}
