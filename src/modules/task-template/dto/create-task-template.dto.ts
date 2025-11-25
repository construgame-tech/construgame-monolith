import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";

export class CreateTaskTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  kpiId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  rewardPoints!: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  measurementUnit?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  totalMeasurementExpected?: string;
}
