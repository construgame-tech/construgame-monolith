import { OrganizationEntity } from "@domain/organization/entities/organization.entity";
import { ApiProperty } from "@nestjs/swagger";

export class OrganizationResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  ownerId!: string;

  @ApiProperty({ example: "Acme Corp" })
  name!: string;

  @ApiProperty({ example: "https://example.com/logo.png", required: false })
  photo?: string;

  static fromEntity(entity: OrganizationEntity): OrganizationResponseDto {
    const dto = new OrganizationResponseDto();
    dto.id = entity.id;
    dto.ownerId = entity.ownerId;
    dto.name = entity.name;
    dto.photo = entity.photo;
    return dto;
  }
}
