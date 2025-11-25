import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, Length, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6, { message: "Recovery code must be 6 digits" })
  recoveryCode!: string;

  @ApiProperty({ example: "newPassword123" })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
