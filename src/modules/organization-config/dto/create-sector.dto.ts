import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateSectorDto {
  @ApiProperty()
  @IsString()
  name: string;
}
