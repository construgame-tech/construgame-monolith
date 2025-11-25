// Game Response DTO
// Formato de resposta padronizado para entidades de Game

import type { GameEntity, GameKpi, GamePrize, GameStatus } from "@domain/game";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GamePrizeResponseDto {
  @ApiProperty({
    description: "Prize ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  prizeId: string;

  @ApiPropertyOptional({
    description: "Ranking type for the prize",
    enum: ["player", "team"],
    example: "player",
  })
  rankingType?: "player" | "team";

  @ApiPropertyOptional({
    description: "Prize type",
    enum: ["points", "placement"],
    example: "points",
  })
  type?: "points" | "placement";

  @ApiPropertyOptional({
    description: "Prize value",
    example: 100,
  })
  value?: number;
}

export class GameKpiResponseDto {
  @ApiProperty({
    description: "KPI ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Points awarded for this KPI",
    example: 50,
  })
  points: number;
}

export class GameResponseDto {
  @ApiProperty({
    description: "Game ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  organizationId: string;

  @ApiProperty({
    description: "Project ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  projectId: string;

  @ApiProperty({
    description: "Game status",
    enum: ["ACTIVE", "PAUSED", "DONE"],
    example: "ACTIVE",
  })
  status: GameStatus;

  @ApiProperty({
    description: "Game name",
    example: "Q1 2024 Sales Challenge",
  })
  name: string;

  @ApiPropertyOptional({
    description: "Game photo URL",
    example: "https://example.com/game-photo.jpg",
  })
  photo?: string;

  @ApiPropertyOptional({
    description: "Game objective description",
    example: "Increase sales by 20% in Q1 2024",
  })
  objective?: string;

  @ApiPropertyOptional({
    description: "Update frequency in days",
    example: 7,
  })
  updateFrequency?: number;

  @ApiPropertyOptional({
    description: "Manager user ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  managerId?: string;

  @ApiPropertyOptional({
    description: "List of responsible user IDs",
    type: [String],
    example: ["123e4567-e89b-12d3-a456-426614174000"],
  })
  responsibles?: string[];

  @ApiPropertyOptional({
    description: "Game start date",
    example: "2024-01-01",
  })
  startDate?: string;

  @ApiPropertyOptional({
    description: "Game end date",
    example: "2024-03-31",
  })
  endDate?: string;

  @ApiPropertyOptional({
    description: "List of prizes",
    type: [GamePrizeResponseDto],
  })
  prizes?: GamePrizeResponseDto[];

  @ApiPropertyOptional({
    description: "List of KPIs",
    type: [GameKpiResponseDto],
  })
  kpis?: GameKpiResponseDto[];

  @ApiPropertyOptional({
    description: "Whether the game is archived",
    example: false,
  })
  archived?: boolean;

  @ApiPropertyOptional({
    description: "Game manager user ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  gameManagerId?: string;

  @ApiProperty({
    description: "Game sequence number (for optimistic locking)",
    example: 0,
  })
  sequence: number;

  static fromEntity(entity: GameEntity): GameResponseDto {
    return {
      id: entity.id,
      organizationId: entity.organizationId,
      projectId: entity.projectId,
      status: entity.status,
      name: entity.name,
      photo: entity.photo,
      objective: entity.objective,
      updateFrequency: entity.updateFrequency,
      managerId: entity.managerId,
      responsibles: entity.responsibles,
      startDate: entity.startDate,
      endDate: entity.endDate,
      prizes: entity.prizes,
      kpis: entity.kpis,
      archived: entity.archived,
      gameManagerId: entity.gameManagerId,
      sequence: entity.sequence,
    };
  }
}

export class GameListResponseDto {
  @ApiProperty({
    description: "List of games",
    type: [GameResponseDto],
  })
  games: GameResponseDto[];

  static fromEntities(entities: GameEntity[]): GameListResponseDto {
    return {
      games: entities.map(GameResponseDto.fromEntity),
    };
  }
}
