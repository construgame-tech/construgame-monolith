import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class GenerateAuthCodeDto {
  @ApiProperty({ example: "+5511999999999" })
  @IsString()
  @Matches(/^\+\d{10,15}$/, {
    message: "Phone must be in international format (+country code + number)",
  })
  phone!: string;
}
