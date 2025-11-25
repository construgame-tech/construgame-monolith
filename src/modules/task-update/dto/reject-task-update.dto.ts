import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RejectTaskUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reviewedBy!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reviewNote?: string;
}
