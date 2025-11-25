import type { MemberRole } from "@domain/member/entities/member.entity";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateMemberDto {
  @ApiProperty({ description: "User ID" })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @ApiProperty({
    description: "Member role",
    enum: ["owner", "admin", "manager", "player", "financial"],
  })
  @IsNotEmpty()
  @IsEnum(["owner", "admin", "manager", "player", "financial"])
  role!: MemberRole;

  @ApiProperty({ description: "Sector ID", required: false })
  @IsOptional()
  @IsString()
  sectorId?: string;

  @ApiProperty({ description: "Sector name", required: false })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiProperty({ description: "Position", required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ description: "Job Role ID", required: false })
  @IsOptional()
  @IsString()
  jobRoleId?: string;

  @ApiProperty({ description: "Job Role Variant ID", required: false })
  @IsOptional()
  @IsString()
  jobRoleVariantId?: string;

  @ApiProperty({ description: "Salary", required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ description: "Seniority", required: false })
  @IsOptional()
  @IsString()
  seniority?: string;

  @ApiProperty({ description: "State", required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: "Hours per day", required: false })
  @IsOptional()
  @IsNumber()
  hoursPerDay?: number;
}
