import { UserEntity } from "@domain/user/entities/user.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "John Doe" })
  name!: string;

  @ApiPropertyOptional({ example: "john@example.com" })
  email?: string;

  @ApiPropertyOptional({ example: "+5511999999999" })
  phone?: string;

  @ApiPropertyOptional({ example: "johndoe" })
  nickname?: string;

  @ApiPropertyOptional({ example: "https://example.com/photo.jpg" })
  photo?: string;

  @ApiProperty({ example: "ACTIVE", enum: ["WAITING_CONFIRMATION", "ACTIVE"] })
  status!: string;

  @ApiPropertyOptional({
    example: "user",
    enum: ["user", "superuser"],
  })
  type?: string;

  @ApiPropertyOptional({ example: "EMP-12345", description: "Custom ID do usuário" })
  customId?: string;

  @ApiProperty({ example: true })
  signedTermsOfUse!: boolean;

  @ApiProperty({ example: true, description: "Whether the user is active" })
  active!: boolean;

  @ApiProperty({
    example: false,
    description: "Whether the user is a superuser",
  })
  superuser!: boolean;

  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.nickname = entity.nickname;
    dto.photo = entity.photo;
    dto.status = entity.status;
    dto.type = entity.type;
    dto.customId = entity.customId;
    dto.signedTermsOfUse = entity.signedTermsOfUse || false;
    dto.active = entity.status === "ACTIVE";
    dto.superuser = entity.type === "superuser";
    return dto;
  }
}
