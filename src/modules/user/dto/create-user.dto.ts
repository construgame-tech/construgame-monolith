import type { MemberRole } from "@domain/member/entities/member.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

const VALID_MEMBER_ROLES = [
  "owner",
  "admin",
  "manager",
  "player",
  "financial",
] as const;

/**
 * DTO para associar o usuário a uma organização durante a criação
 */
export class UserOrganizationDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID da organização",
  })
  @IsUUID()
  organizationId: string;

  @ApiProperty({
    example: "player",
    description: "Papel do usuário na organização",
    enum: VALID_MEMBER_ROLES,
  })
  @IsIn(VALID_MEMBER_ROLES)
  role: MemberRole;
}

export class CreateUserDto {
  @ApiProperty({
    example: "John Doe",
    description: "Full name of the user",
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "john@example.com", required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: "+5511999999999", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: "johndoe", required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ example: "https://example.com/photo.jpg", required: false })
  @IsString()
  @IsOptional()
  photo?: string;

  @ApiProperty({ example: "custom-123", required: false })
  @IsString()
  @IsOptional()
  customId?: string;

  @ApiProperty({ example: "senha123", required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  signedTermsOfUse?: boolean;

  @ApiPropertyOptional({
    description: "Organização para associar o usuário como membro",
    type: UserOrganizationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserOrganizationDto)
  organization?: UserOrganizationDto;
}
