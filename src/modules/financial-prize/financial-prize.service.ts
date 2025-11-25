import { randomUUID } from "node:crypto";
import { createFinancialPrizeEntity } from "@domain/financial-prizes/entities/financial-prize.entity";
import type { IFinancialPrizeRepository } from "@domain/financial-prizes/repositories/financial-prize.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import type { CreateFinancialPrizeDto } from "./dto/create-financial-prize.dto";

@Injectable()
export class FinancialPrizeService {
  constructor(
    @Inject("IFinancialPrizeRepository")
    private readonly repository: IFinancialPrizeRepository,
  ) {}

  async create(dto: CreateFinancialPrizeDto) {
    const prize = createFinancialPrizeEntity({
      id: randomUUID(),
      organizationId: dto.organizationId,
      projectId: dto.projectId,
      gameId: dto.gameId,
      userId: dto.userId,
      amount: dto.amount,
      period: dto.period,
      details: dto.details,
    });

    await this.repository.save(prize);
    return prize;
  }

  async findByUserAndPeriod(userId: string, gameId: string, period: string) {
    return this.repository.findByUserAndPeriod(userId, gameId, period);
  }

  async findByGameAndPeriod(gameId: string, period: string) {
    return this.repository.findByGameAndPeriod(gameId, period);
  }

  async findByUser(userId: string) {
    return this.repository.findByUser(userId);
  }
}
