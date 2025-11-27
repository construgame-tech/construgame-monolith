import type { FinancialPrizeEntity } from "@domain/financial-prizes/entities/financial-prize.entity";
import type { IFinancialPrizeRepository } from "@domain/financial-prizes/repositories/financial-prize.repository.interface";
import type { DrizzleDB } from "@infrastructure/database/database.module";
import { financialPrizes } from "@infrastructure/database/schemas";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

@Injectable()
export class FinancialPrizeRepository implements IFinancialPrizeRepository {
  constructor(@Inject("DRIZZLE_CONNECTION") private readonly db: DrizzleDB) {}

  async save(prize: FinancialPrizeEntity): Promise<void> {
    await this.db
      .insert(financialPrizes)
      .values({
        id: prize.id,
        organizationId: prize.organizationId,
        projectId: prize.projectId,
        gameId: prize.gameId,
        userId: prize.userId,
        amount: prize.amount.toString(),
        period: prize.period,
        calculatedAt: prize.calculatedAt,
        details: prize.details,
      })
      .onConflictDoUpdate({
        target: financialPrizes.id,
        set: {
          amount: prize.amount.toString(),
          details: prize.details,
        },
      });
  }

  async findByUserAndPeriod(
    userId: string,
    gameId: string,
    period: string,
  ): Promise<FinancialPrizeEntity | null> {
    const result = await this.db
      .select()
      .from(financialPrizes)
      .where(
        and(
          eq(financialPrizes.userId, userId),
          eq(financialPrizes.gameId, gameId),
          eq(financialPrizes.period, period),
        ),
      )
      .limit(1);

    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByGameAndPeriod(
    gameId: string,
    period: string,
  ): Promise<FinancialPrizeEntity[]> {
    const result = await this.db
      .select()
      .from(financialPrizes)
      .where(
        and(
          eq(financialPrizes.gameId, gameId),
          eq(financialPrizes.period, period),
        ),
      );

    return result.map(this.mapToEntity);
  }

  async findByUser(userId: string): Promise<FinancialPrizeEntity[]> {
    const result = await this.db
      .select()
      .from(financialPrizes)
      .where(eq(financialPrizes.userId, userId));

    return result.map(this.mapToEntity);
  }

  private mapToEntity(
    row: typeof financialPrizes.$inferSelect,
  ): FinancialPrizeEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      projectId: row.projectId,
      gameId: row.gameId,
      userId: row.userId,
      amount: parseFloat(row.amount),
      period: row.period,
      calculatedAt: row.calculatedAt,
      details: row.details ?? undefined,
    };
  }
}
