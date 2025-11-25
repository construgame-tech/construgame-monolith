import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class JobRoleVariantDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seniority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  hoursPerDay?: number;
}

export class CreateJobRoleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: [JobRoleVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobRoleVariantDto)
  variants: JobRoleVariantDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
