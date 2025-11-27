import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export enum BatchAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
}

export class BatchTaskCommandDto {
  @ApiProperty({ enum: BatchAction, example: "create" })
  @IsEnum(BatchAction)
  @IsNotEmpty()
  action!: BatchAction;

  @ApiPropertyOptional({
    description: "Task ID (required for update and delete)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsOptional()
  taskId?: string;

  @ApiPropertyOptional({
    description: "Game ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsOptional()
  gameId?: string;

  @ApiPropertyOptional({ example: "Task name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsOptional()
  managerId?: string;

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsOptional()
  kpiId?: string;

  @ApiPropertyOptional({ example: "Task description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: "https://example.com/video" })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ example: "https://example.com/embed" })
  @IsString()
  @IsOptional()
  embedVideoUrl?: string;

  @ApiPropertyOptional({ example: "m3" })
  @IsString()
  @IsOptional()
  measurementUnit?: string;

  @ApiPropertyOptional({ example: "100" })
  @IsString()
  @IsOptional()
  totalMeasurementExpected?: string;

  @ApiPropertyOptional({ example: "50" })
  @IsString()
  @IsOptional()
  rewardPoints?: string;

  @ApiPropertyOptional({ example: "2024-01-01" })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: "2024-12-31" })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsArray()
  @IsOptional()
  checklist?: Array<{ id?: string; label: string }>;
}

export class BatchTaskDto {
  @ApiProperty({ type: [BatchTaskCommandDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchTaskCommandDto)
  commands!: BatchTaskCommandDto[];
}
