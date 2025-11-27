import type { FinancialPrizeEntity } from "@domain/financial-prizes/entities/financial-prize.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FinancialPrizeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  gameId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  period: string;

  @ApiProperty()
  calculatedAt: string;

  @ApiPropertyOptional()
  details?: {
    laborCost?: number;
    kpiMultiplier?: number;
    taskPoints?: number;
    kaizenPoints?: number;
  };


  static fromEntity(entity: FinancialPrizeEntity): FinancialPrizeResponseDto {
    return {
      id: entity.id,
      organizationId: entity.organizationId,
      projectId: entity.projectId,
      gameId: entity.gameId,
      userId: entity.userId,
      amount: entity.amount,
      period: entity.period,
      calculatedAt: entity.calculatedAt,
      details: entity.details,
    };
  }
}
