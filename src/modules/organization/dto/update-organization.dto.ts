import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateOrganizationDto {
  @ApiProperty({ example: "Acme Corp", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "https://example.com/logo.png", required: false })
  @IsString()
  @IsOptional()
  photo?: string;
}
