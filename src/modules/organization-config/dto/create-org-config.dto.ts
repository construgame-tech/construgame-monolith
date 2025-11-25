import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsObject,
  IsOptional,
  ValidateNested,
} from "class-validator";

class MissionConfigDto {
  @ApiProperty()
  @IsBoolean()
  autoApproveUpdates: boolean;
}

class ThemeMenuDto {
  @ApiProperty()
  background: string;

  @ApiProperty()
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
}
