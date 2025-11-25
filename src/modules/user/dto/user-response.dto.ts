import { UserEntity } from "@domain/user/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "John Doe" })
  name!: string;

  @ApiProperty({ example: "john@example.com", required: false })
  email?: string;

  @ApiProperty({ example: "+5511999999999", required: false })
  phone?: string;

  @ApiProperty({ example: "johndoe", required: false })
  nickname?: string;

  @ApiProperty({ example: "https://example.com/photo.jpg", required: false })
  photo?: string;

  @ApiProperty({ example: "ACTIVE", enum: ["WAITING_CONFIRMATION", "ACTIVE"] })
  status!: string;

  @ApiProperty({
    example: "user",
    enum: ["user", "superuser"],
    required: false,
  })
  type?: string;

  @ApiProperty({ example: true })
  signedTermsOfUse!: boolean;

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
    dto.signedTermsOfUse = entity.signedTermsOfUse || false;
    return dto;
  }
}
