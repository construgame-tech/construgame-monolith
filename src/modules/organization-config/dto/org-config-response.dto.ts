import type { OrgConfigEntity } from "@domain/organization-config/entities/org-config.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class OrgConfigResponseDto {
  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  missionsEnabled: boolean;

  @ApiProperty()
  financialEnabled: boolean;

  @ApiProperty()
  kaizensEnabled: boolean;

  @ApiPropertyOptional()
  projectDiaryEnabled?: boolean;

  @ApiPropertyOptional()
  missionConfig?: {
    autoApproveUpdates: boolean;
  };

  @ApiProperty()
  theme: {
    menu: {
      background: string;
      color: string;
    };
  };

  @ApiProperty()
  auth: {
    login: {
      email: boolean;
      microsoftSSO: boolean;
    };
  };


  static fromEntity(entity: OrgConfigEntity): OrgConfigResponseDto {
    return {
      organizationId: entity.organizationId,
      missionsEnabled: entity.missionsEnabled,
      financialEnabled: entity.financialEnabled,
      kaizensEnabled: entity.kaizensEnabled,
      projectDiaryEnabled: entity.projectDiaryEnabled,
      missionConfig: entity.missionConfig,
      theme: entity.theme,
      auth: entity.auth,
    };
  }
}
