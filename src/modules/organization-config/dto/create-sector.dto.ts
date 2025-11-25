import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSectorDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
