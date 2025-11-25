// Create Game DTO
// Validação de entrada para criação de novos games

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";

export enum GameRankingType {
  PLAYER = "player",
  TEAM = "team",
}

export enum GamePrizeType {
  POINTS = "points",
  PLACEMENT = "placement",
}

export class GamePrizeDto {
  @ApiProperty({
    description: "Prize ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  prizeId: string;

  @ApiPropertyOptional({
    description: "Ranking type for the prize",
    enum: GameRankingType,
    example: GameRankingType.PLAYER,
  })
  @IsOptional()
  @IsEnum(GameRankingType)
  rankingType?: GameRankingType;

  @ApiPropertyOptional({
    description: "Prize type",
    enum: GamePrizeType,
    example: GamePrizeType.POINTS,
  })
  @IsOptional()
  @IsEnum(GamePrizeType)
  type?: GamePrizeType;

  @ApiPropertyOptional({
    description: "Prize value",
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;
}

export class GameKpiDto {
  @ApiProperty({
    description: "KPI ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: "Points awarded for this KPI",
    example: 50,
  })
  @IsNumber()
  @IsInt()
  @Min(0)
  points: number;
}

export class CreateGameDto {
  @ApiProperty({
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  organizationId: string;

  @ApiProperty({
    description: "Project ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  projectId: string;

  @ApiProperty({
    description: "Game name",
    example: "Q1 2024 Sales Challenge",
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: "Game manager user ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  gameManagerId?: string;

  @ApiPropertyOptional({
    description: "Game photo URL",
    example: "https://example.com/game-photo.jpg",
  })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({
    description: "Game start date (ISO format or YYYY-MM-DD)",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Game end date (ISO format or YYYY-MM-DD)",
    example: "2024-03-31",
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Manager user ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiPropertyOptional({
    description: "List of responsible user IDs",
    type: [String],
    example: [
      "123e4567-e89b-12d3-a456-426614174000",
      "123e4567-e89b-12d3-a456-426614174001",
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  responsibles?: string[];

  @ApiPropertyOptional({
    description: "Game objective description",
    example: "Increase sales by 20% in Q1 2024",
  })
  @IsOptional()
  @IsString()
  objective?: string;

  @ApiPropertyOptional({
    description: "List of prizes for the game",
    type: [GamePrizeDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GamePrizeDto)
  prizes?: GamePrizeDto[];

  @ApiPropertyOptional({
    description: "List of KPIs with their point values",
    type: [GameKpiDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameKpiDto)
  kpis?: GameKpiDto[];

  @ApiPropertyOptional({
    description: "Update frequency in days",
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(1)
  updateFrequency?: number;
}
