import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateKaizenTypeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  points: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  ideaPoints?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  ideaExecutionPoints?: number;
}
