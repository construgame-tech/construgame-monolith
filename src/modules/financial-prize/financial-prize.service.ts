import {
  createFinancialPrize,
  findPrizeByUserAndPeriod,
  findPrizesByGameAndPeriod,
  listUserPrizes,
} from "@domain/financial-prizes";
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
    const { prize } = await createFinancialPrize(
      {
        organizationId: dto.organizationId,
        projectId: dto.projectId,
        gameId: dto.gameId,
        userId: dto.userId,
        amount: dto.amount,
        period: dto.period,
        details: dto.details ? {
          laborCost: dto.details.laborCost,
          kpiMultiplier: dto.details.kpiMultiplier,
          taskPoints: dto.details.taskPoints,
          kaizenPoints: dto.details.kaizenPoints,
        } : undefined,
      },
      this.repository,
    );

    return prize;
  }

  async findByUserAndPeriod(userId: string, gameId: string, period: string) {
    const { prize } = await findPrizeByUserAndPeriod(
      { userId, gameId, period },
      this.repository,
    );
    return prize;
  }

  async findByGameAndPeriod(gameId: string, period: string) {
    const { prizes } = await findPrizesByGameAndPeriod(
      { gameId, period },
      this.repository,
    );
    return prizes;
  }

  async findByUser(userId: string) {
    const { prizes } = await listUserPrizes(
      { userId },
      this.repository,
    );
    return prizes;
  }
}
