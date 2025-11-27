import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SsoMicrosoftDto {
  @ApiProperty({
    description:
      "The authorization code received from Microsoft /authorize call",
    example: "0.ARABvZ3p...",
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
