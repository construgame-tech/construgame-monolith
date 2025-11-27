import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

class MissionConfigDto {
  @ApiProperty()
  @IsBoolean()
  autoApproveUpdates: boolean;
}

class ThemeMenuDto {
  @ApiProperty()
  @IsString()
  background: string;

  @ApiProperty()
  @IsString()
  color: string;
}

class ThemeConfigDto {
  @ApiProperty({ type: ThemeMenuDto })
  @ValidateNested()
  @Type(() => ThemeMenuDto)
  menu: ThemeMenuDto;
}

class AuthLoginDto {
  @ApiProperty()
  @IsBoolean()
  email: boolean;

  @ApiProperty()
  @IsBoolean()
  microsoftSSO: boolean;
}

class AuthConfigDto {
  @ApiProperty({ type: AuthLoginDto })
  @ValidateNested()
  @Type(() => AuthLoginDto)
  login: AuthLoginDto;
}

export class CreateOrgConfigDto {
  @ApiPropertyOptional({ description: "Organization ID (ignored, taken from URL)" })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiProperty()
  @IsBoolean()
  missionsEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  financialEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  kaizensEnabled: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  projectDiaryEnabled?: boolean;

  @ApiPropertyOptional({ type: MissionConfigDto })
  @IsObject()
  @ValidateNested()
  @Type(() => MissionConfigDto)
  @IsOptional()
  missionConfig?: MissionConfigDto;

  @ApiProperty({ type: ThemeConfigDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ThemeConfigDto)
  theme: ThemeConfigDto;

  @ApiProperty({ type: AuthConfigDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AuthConfigDto)
  auth: AuthConfigDto;

  @ApiPropertyOptional({ description: "Sequence number (optional)" })
  @IsNumber()
  @IsOptional()
  sequence?: number;
}
