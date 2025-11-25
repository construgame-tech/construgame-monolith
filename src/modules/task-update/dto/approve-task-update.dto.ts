import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class TaskUpdateChecklistItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty()
  @IsNotEmpty()
  checked!: boolean;
}

export class ApproveTaskUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reviewedBy!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reviewNote?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  progressAbsolute?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  participants?: string[];

  @ApiPropertyOptional({ type: [TaskUpdateChecklistItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskUpdateChecklistItemDto)
  @IsOptional()
  checklist?: TaskUpdateChecklistItemDto[];

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
