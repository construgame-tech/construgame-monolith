import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString, ValidateIf } from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "John Doe", nullable: true })
  @ValidateIf((o) => o.name !== null)
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiPropertyOptional({ example: "john@example.com", nullable: true })
  @ValidateIf((o) => o.email !== null)
  @IsEmail()
  @IsOptional()
  email?: string | null;

  @ApiPropertyOptional({ example: "+5511999999999", nullable: true })
  @ValidateIf((o) => o.phone !== null)
  @IsString()
  @IsOptional()
  phone?: string | null;

  @ApiPropertyOptional({ example: "johndoe", nullable: true })
  @ValidateIf((o) => o.nickname !== null)
  @IsString()
  @IsOptional()
  nickname?: string | null;

  @ApiPropertyOptional({ example: "https://example.com/photo.jpg", nullable: true })
  @ValidateIf((o) => o.photo !== null)
  @IsString()
  @IsOptional()
  photo?: string | null;

  @ApiPropertyOptional({ example: "custom-123", nullable: true })
  @ValidateIf((o) => o.customId !== null)
  @IsString()
  @IsOptional()
  customId?: string | null;

  @ApiPropertyOptional({ example: true, nullable: true })
  @ValidateIf((o) => o.signedTermsOfUse !== null)
  @IsBoolean()
  @IsOptional()
  signedTermsOfUse?: boolean | null;
}
