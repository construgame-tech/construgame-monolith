import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class LeaguePrizeDto {
  @ApiProperty()
  @IsString()
  prizeId: string;
}

export class UpdateLeagueDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  responsibleId?: string;

  @ApiProperty({
    enum: ["ACTIVE", "ARCHIVED", "DONE", "PAUSED"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["ACTIVE", "ARCHIVED", "DONE", "PAUSED"])
  status?: "ACTIVE" | "ARCHIVED" | "DONE" | "PAUSED";

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  objective?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ type: [LeaguePrizeDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeaguePrizeDto)
  prizes?: LeaguePrizeDto[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projects?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  games?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
