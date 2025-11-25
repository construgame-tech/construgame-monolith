import type { PrizeEntity } from "@domain/organization-config/entities/prize.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PrizeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  icon?: string;

  @ApiPropertyOptional()
  photo?: string;

  static fromEntity(entity: PrizeEntity): PrizeResponseDto {
    return {
      id: entity.id,
      organizationId: entity.organizationId,
      name: entity.name,
      description: entity.description,
      icon: entity.icon,
      photo: entity.photo,
    };
  }
}
