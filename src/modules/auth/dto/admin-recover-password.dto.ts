import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class AdminRecoverPasswordDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string;
}
