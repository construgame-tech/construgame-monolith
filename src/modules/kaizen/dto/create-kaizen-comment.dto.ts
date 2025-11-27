import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateKaizenCommentDto {
  @ApiProperty({ description: "Comment text" })
  @IsString()
  @IsNotEmpty()
  text: string;
}
