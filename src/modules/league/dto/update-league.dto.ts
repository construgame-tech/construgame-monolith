import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  Allow,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from "class-validator";

// DTO para prize - aceita campos extras que vêm do frontend
class LeaguePrizeDto {
  @ApiProperty()
  @IsString()
  prizeId: string;

  // Permite campos extras que vêm do frontend (id, name, type, etc)
  @Allow()
  id?: string;

  @Allow()
  name?: string;

  @Allow()
  type?: string;

  @Allow()
  image?: string;

  @Allow()
  icon?: string;

  @Allow()
  organizationId?: string;

  @Allow()
  description?: string;

  @Allow()
  photo?: string;
}

export class UpdateLeagueDto {
  // Campos que vêm no body mas são ignorados (usamos os do path param)
  @ApiProperty({ required: false, description: "Ignored - uses path param" })
  @IsOptional()
  @ValidateIf((o) => o.id !== "")
  @IsUUID()
  id?: string;

  @ApiProperty({ required: false, description: "Ignored - uses path param" })
  @IsOptional()
  @ValidateIf((o) => o.organizationId !== "")
  @IsUUID()
  organizationId?: string;

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
