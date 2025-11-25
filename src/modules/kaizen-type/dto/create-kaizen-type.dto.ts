import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateKaizenTypeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
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
