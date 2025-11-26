import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class OrganizationListItemDto {
  @ApiProperty({ description: "Organization ID" })
  id: string;

  @ApiProperty({ description: "Organization name" })
  name: string;

  @ApiPropertyOptional({ description: "Organization photo URL" })
  photo?: string;

  @ApiProperty({ description: "Owner user ID" })
  ownerId: string;
}
