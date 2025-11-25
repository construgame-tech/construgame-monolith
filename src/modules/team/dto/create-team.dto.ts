import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateTeamDto {
  @ApiProperty({ description: "Team name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Manager user ID", required: false })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiProperty({ description: "Field of action", required: false })
  @IsOptional()
  @IsString()
  fieldOfAction?: string;

  @ApiProperty({
    description: "Member user IDs",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  members?: string[];

  @ApiProperty({ description: "Team photo URL", required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ description: "Team color (hex)", required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: "Team description", required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
