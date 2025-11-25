// Update Game DTO
// Validação de entrada para atualização de games existentes

import { ApiPropertyOptional } from "@nestjs/swagger";
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
import { GameKpiDto, GamePrizeDto } from "./create-game.dto";

export enum GameStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  DONE = "DONE",
}

export class UpdateGameDto {
  @ApiPropertyOptional({
    description: "Organization ID (required for validation)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({
    description: "Game status",
    enum: GameStatus,
    example: GameStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;

  @ApiPropertyOptional({
    description: "Game name",
    example: "Q1 2024 Sales Challenge - Updated",
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Game photo URL",
    example: "https://example.com/game-photo-updated.jpg",
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
    example: "Increase sales by 25% in Q1 2024",
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
