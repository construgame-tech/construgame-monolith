import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

class LeaguePrizeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  prizeId: string;
}

export class CreateLeagueDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  responsibleId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

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

  // Campo opcional para compatibilidade com frontend que envia no body
  // O valor real é obtido do path param e este campo é ignorado
  @ApiProperty({ required: false, description: "Ignored - use path param instead" })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
