import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserOrganizationItemDto {
  @ApiProperty({ description: "Organization ID" })
  id: string;

  @ApiProperty({ description: "Organization name" })
  name: string;

  @ApiPropertyOptional({ description: "Organization photo URL" })
  photo?: string;

  @ApiProperty({ description: "User role in this organization" })
  role: string;
}

export class UserOrganizationsResponseDto {
  @ApiProperty({
    type: [UserOrganizationItemDto],
    description: "List of organizations the user belongs to",
  })
  items: UserOrganizationItemDto[];
}
