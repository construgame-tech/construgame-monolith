import type { KaizenStatus } from "@domain/kaizen";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class KaizenTaskDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  responsibleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  isComplete?: boolean;
}

class KaizenBenefitDto {
  @ApiProperty()
  @IsString()
  kpiId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

class KaizenAttachmentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  size: number;

  @ApiProperty()
  @IsString()
  filetype: string;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsString()
  url: string;
}

class KaizenResponsiblesDto {
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  players?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teams?: string[];
}

export class UpdateKaizenDto {
  @ApiProperty({
    required: false,
    enum: ["ACTIVE", "DONE", "APPROVED", "ARCHIVED"],
  })
  @IsOptional()
  @IsEnum(["ACTIVE", "DONE", "APPROVED", "ARCHIVED"])
  status?: KaizenStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gameId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  leaderId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  category?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentSituation?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentSituationImages?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  solution?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  solutionImages?: string[];

  @ApiProperty({ type: [KaizenTaskDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KaizenTaskDto)
  tasks?: KaizenTaskDto[];

  @ApiProperty({ type: KaizenResponsiblesDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => KaizenResponsiblesDto)
  responsibles?: KaizenResponsiblesDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  kaizenIdeaId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  kaizenTypeId?: string;

  @ApiProperty({ type: [KaizenBenefitDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KaizenBenefitDto)
  benefits?: KaizenBenefitDto[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

  @ApiProperty({ type: [KaizenAttachmentDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KaizenAttachmentDto)
  attachments?: KaizenAttachmentDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resources?: string;
}
