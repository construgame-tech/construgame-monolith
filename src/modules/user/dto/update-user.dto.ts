import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ example: "John Doe", required: false })
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

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  signedTermsOfUse?: boolean;
}
