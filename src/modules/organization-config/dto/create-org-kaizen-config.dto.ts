import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class CategoryPointsDto {
  @ApiProperty()
  @IsNumber()
  points: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

class CategoryPointsMapDto {
  @ApiProperty({ type: CategoryPointsDto })
  @ValidateNested()
  @Type(() => CategoryPointsDto)
  "1": CategoryPointsDto;

  @ApiPropertyOptional({ type: CategoryPointsDto })
  @ValidateNested()
  @Type(() => CategoryPointsDto)
  @IsOptional()
  "2"?: CategoryPointsDto;

  @ApiPropertyOptional({ type: CategoryPointsDto })
  @ValidateNested()
  @Type(() => CategoryPointsDto)
  @IsOptional()
  "3"?: CategoryPointsDto;

  @ApiPropertyOptional({ type: CategoryPointsDto })
  @ValidateNested()
  @Type(() => CategoryPointsDto)
  @IsOptional()
  "4"?: CategoryPointsDto;

  @ApiPropertyOptional({ type: CategoryPointsDto })
  @ValidateNested()
  @Type(() => CategoryPointsDto)
  @IsOptional()
  "5"?: CategoryPointsDto;
}

export class CreateOrgKaizenConfigDto {
  @ApiProperty({ type: CategoryPointsMapDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CategoryPointsMapDto)
  categoryPoints: CategoryPointsMapDto;
}
