import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RejectTaskUpdateDto {
  @ApiPropertyOptional({ description: "ID do usuário revisor (opcional, usa JWT se não informado)" })
  @IsString()
  @IsOptional()
  reviewedBy?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reviewNote?: string;
}
