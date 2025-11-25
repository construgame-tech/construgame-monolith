import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateKpiDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;
}
