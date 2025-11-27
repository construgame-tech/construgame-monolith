import { ApiPropertyOptional } from "@nestjs/swagger";

export class SearchResultUserDto {
  @ApiPropertyOptional({ description: "User ID" })
  id: string;

  @ApiPropertyOptional({ description: "User name" })
  name: string;

  @ApiPropertyOptional({ description: "User nickname" })
  nickname?: string;

  @ApiPropertyOptional({ description: "User photo URL" })
  photo?: string;
}

export class SearchResultOrganizationDto {
  @ApiPropertyOptional({ description: "Organization ID" })
  id: string;

  @ApiPropertyOptional({ description: "Organization name" })
  name: string;

  @ApiPropertyOptional({ description: "Organization photo URL" })
  photo?: string;
}
