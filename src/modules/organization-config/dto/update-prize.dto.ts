import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class UpdatePrizeDto {
  @ApiPropertyOptional({ description: "ID do prêmio (ignorado, vem da URL)" })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({
    description: "ID da organização (ignorado, vem da URL)",
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  photo?: string;
}
