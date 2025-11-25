import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

class ProjectPrizeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  prizeId: string;
}

export class CreateProjectDto {
  @ApiProperty({ description: "Project name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "Responsible user IDs",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibles?: string[];

  @ApiProperty({ description: "Active game ID", required: false })
  @IsOptional()
  @IsString()
  activeGameId?: string;

  @ApiProperty({ description: "Project photo URL", required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ description: "Project type", required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: "State", required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: "City", required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: "Start date (ISO string)", required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ description: "End date (ISO string)", required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    description: "Project prizes",
    type: [ProjectPrizeDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  prizes?: ProjectPrizeDto[];

  @ApiProperty({ description: "Team IDs", type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teams?: string[];
}
