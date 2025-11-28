import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class KaizenIdeaTaskDto {
  @ApiProperty()
  @IsString()
  name: string;
}

class KaizenIdeaBenefitDto {
  @ApiProperty()
  @IsString()
  kpiId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

class KaizenIdeaAttachmentDto {
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

class KaizenIdeaAuthorsDto {
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

class KaizenIdeaProblemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

class KaizenIdeaSolutionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

class KaizenIdeaNonExecutableProjectDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  justification?: string;
}

export class UpdateKaizenIdeaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gameId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  kaizenTypeId?: string;

  @ApiProperty({ enum: ["DRAFT", "APPROVED", "ARCHIVED"], required: false })
  @IsOptional()
  @IsEnum(["DRAFT", "APPROVED", "ARCHIVED"])
  status?: "DRAFT" | "APPROVED" | "ARCHIVED";

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @ApiProperty({ type: KaizenIdeaAuthorsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => KaizenIdeaAuthorsDto)
  authors?: KaizenIdeaAuthorsDto;

  @ApiProperty({ type: KaizenIdeaProblemDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => KaizenIdeaProblemDto)
  problem?: KaizenIdeaProblemDto;

  @ApiProperty({ type: KaizenIdeaSolutionDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => KaizenIdeaSolutionDto)
  solution?: KaizenIdeaSolutionDto;

  @ApiProperty({ type: [KaizenIdeaTaskDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KaizenIdeaTaskDto)
  tasks?: KaizenIdeaTaskDto[];

  @ApiProperty({ type: [KaizenIdeaBenefitDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KaizenIdeaBenefitDto)
  benefits?: KaizenIdeaBenefitDto[];

  @ApiProperty({ type: [KaizenIdeaAttachmentDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KaizenIdeaAttachmentDto)
  attachments?: KaizenIdeaAttachmentDto[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  executableKaizenProjectIds?: string[];

  @ApiProperty({ type: [KaizenIdeaNonExecutableProjectDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KaizenIdeaNonExecutableProjectDto)
  nonExecutableProjects?: KaizenIdeaNonExecutableProjectDto[];
}
