import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class TaskChecklistItemDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: "Check item 1" })
  @IsString()
  label!: string;
}

export class CreateTaskDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsNotEmpty()
  @IsUUID()
  gameId!: string;

  @ApiProperty({ example: "Fix the roof" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  rewardPoints!: number;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @ApiProperty({ example: "Building A", required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  kpiId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  taskManagerId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  managerId?: string;

  @ApiProperty({ example: "Description of the task", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: "meters", required: false })
  @IsString()
  @IsOptional()
  measurementUnit?: string;

  @ApiProperty({ example: "100", required: false })
  @IsString()
  @IsOptional()
  totalMeasurementExpected?: string;

  @ApiProperty({ example: "https://example.com/video.mp4", required: false })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ example: "https://example.com/embed", required: false })
  @IsString()
  @IsOptional()
  embedVideoUrl?: string;

  @ApiProperty({ type: [TaskChecklistItemDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskChecklistItemDto)
  @IsOptional()
  checklist?: TaskChecklistItemDto[];

  @ApiProperty({ example: "2023-01-01", required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: "2023-01-31", required: false })
  @IsString()
  @IsOptional()
  endDate?: string;
}
