import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

class TaskUpdateProgressDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  absolute?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  percent?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  hours?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  updatedAt!: string;
}

class TaskUpdateChecklistItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty()
  @IsNotEmpty()
  checked!: boolean;
}

class TaskUpdateFileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsNumber()
  size!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filetype!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  createdAt?: string;
}

export class CreateTaskUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gameId!: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  taskId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  submittedBy!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  participants?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ type: TaskUpdateProgressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => TaskUpdateProgressDto)
  progress!: TaskUpdateProgressDto;

  @ApiPropertyOptional({ type: [TaskUpdateChecklistItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskUpdateChecklistItemDto)
  @IsOptional()
  checklist?: TaskUpdateChecklistItemDto[];

  @ApiPropertyOptional({ type: [TaskUpdateFileDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskUpdateFileDto)
  @IsOptional()
  files?: TaskUpdateFileDto[];
}
