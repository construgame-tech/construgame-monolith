import type { KaizenCommentEntity } from "@domain/kaizen/entities/kaizen-comment.entity";
import type { IKaizenCommentRepository } from "@domain/kaizen/repositories/kaizen-comment.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { kaizenComments } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

@Injectable()
export class KaizenCommentRepository implements IKaizenCommentRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(comment: KaizenCommentEntity): Promise<void> {
    await this.db
      .insert(kaizenComments)
      .values({
        id: comment.id,
        kaizenId: comment.kaizenId,
        userId: comment.userId,
        text: comment.text,
        createdAt: comment.createdAt,
      })
      .onConflictDoUpdate({
        target: kaizenComments.id,
        set: {
          text: comment.text,
        },
      });
  }

  async findById(id: string): Promise<KaizenCommentEntity | null> {
    const result = await this.db
      .select()
      .from(kaizenComments)
      .where(eq(kaizenComments.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      kaizenId: row.kaizenId,
      userId: row.userId,
      text: row.text,
      createdAt: row.createdAt,
    };
  }

  async findByKaizenId(kaizenId: string): Promise<KaizenCommentEntity[]> {
    const result = await this.db
      .select()
      .from(kaizenComments)
      .where(eq(kaizenComments.kaizenId, kaizenId));

    return result.map((row) => ({
      id: row.id,
      kaizenId: row.kaizenId,
      userId: row.userId,
      text: row.text,
      createdAt: row.createdAt,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(kaizenComments).where(eq(kaizenComments.id, id));
  }
}
