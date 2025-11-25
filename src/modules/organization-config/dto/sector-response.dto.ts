import type { SectorEntity } from "@domain/organization-config/entities/sector.entity";
import { ApiProperty } from "@nestjs/swagger";

export class SectorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  name: string;

  static fromEntity(entity: SectorEntity): SectorResponseDto {
    return {
      id: entity.id,
      organizationId: entity.organizationId,
      name: entity.name,
    };
  }
}
