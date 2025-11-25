import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class UpdateTaskTemplateDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  kpiId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  rewardPoints?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  measurementUnit?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  totalMeasurementExpected?: string;
}
