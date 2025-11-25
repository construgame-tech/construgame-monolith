import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateKpiDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;
}
