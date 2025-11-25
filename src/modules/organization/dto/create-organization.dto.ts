import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateOrganizationDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID of the owner user",
  })
  @IsNotEmpty()
  @IsUUID()
  ownerId!: string;

  @ApiProperty({
    example: "Acme Corp",
    description: "Name of the organization",
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: "https://example.com/logo.png", required: false })
  @IsString()
  @IsOptional()
  photo?: string;
}
