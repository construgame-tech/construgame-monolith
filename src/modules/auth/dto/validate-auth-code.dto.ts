import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";

export class ValidateAuthCodeDto {
  @ApiProperty({ example: "+5511999999999" })
  @IsString()
  @Matches(/^\+\d{10,15}$/, {
    message: "Phone must be in international format (+country code + number)",
  })
  phone!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6, { message: "Auth code must be 6 digits" })
  authCode!: string;
}
