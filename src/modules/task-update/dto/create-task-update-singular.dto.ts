import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

// DTO para checklist item com label (como vem do frontend)
class TaskUpdateChecklistItemWithLabelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  checked!: boolean;
}

// DTO para arquivos
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

/**
 * DTO para criação de task update via rota singular
 * POST /game/:gameId/task/:taskId/update
 * 
 * Aceita campos no nível raiz (como o frontend envia):
 * - absolute, hours, note, etc
 * 
 * gameId, taskId vêm do path
 * submittedBy vem do token JWT
 */
export class CreateTaskUpdateSingularDto {
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

  @ApiPropertyOptional({ type: [TaskUpdateChecklistItemWithLabelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskUpdateChecklistItemWithLabelDto)
  @IsOptional()
  checklist?: TaskUpdateChecklistItemWithLabelDto[];

  @ApiPropertyOptional({ type: [TaskUpdateFileDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskUpdateFileDto)
  @IsOptional()
  files?: TaskUpdateFileDto[];
}
