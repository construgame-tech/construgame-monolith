import type { OrgKaizenConfigEntity } from "@domain/organization-config/entities/org-kaizen-config.entity";
import { ApiProperty } from "@nestjs/swagger";

export class OrgKaizenConfigResponseDto {
  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  categoryPoints: {
    "1": { points: number; description?: string };
    "2"?: { points: number; description?: string };
    "3"?: { points: number; description?: string };
    "4"?: { points: number; description?: string };
    "5"?: { points: number; description?: string };
  };

  static fromEntity(entity: OrgKaizenConfigEntity): OrgKaizenConfigResponseDto {
    return {
      organizationId: entity.organizationId,
      categoryPoints: entity.categoryPoints,
    };
  }
}
