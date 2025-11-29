import type {
  TeamEntity,
  TeamWithDetails,
} from "@domain/team/entities/team.entity";
import { ApiProperty } from "@nestjs/swagger";

// DTO para informações básicas de membro/manager
export class TeamMemberInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  status: "WAITING_CONFIRMATION" | "ACTIVE";

  @ApiProperty({ required: false })
  photo?: string;

  static fromData(data: {
    id: string;
    name: string;
    status: "WAITING_CONFIRMATION" | "ACTIVE";
    photo?: string;
  }): TeamMemberInfoDto {
    const dto = new TeamMemberInfoDto();
    dto.id = data.id;
    dto.name = data.name;
    dto.status = data.status;
    if (data.photo) {
      dto.photo = data.photo;
    }
    return dto;
  }
}

export class TeamResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  fieldOfAction?: string;

  @ApiProperty({ required: false })
  photo?: string;

  @ApiProperty({ required: false })
  managerId?: string;

  @ApiProperty({ type: TeamMemberInfoDto, required: false })
  manager?: TeamMemberInfoDto;

  @ApiProperty({ type: [TeamMemberInfoDto], required: false })
  members?: TeamMemberInfoDto[];

  @ApiProperty({ required: false })
  color?: string;

  @ApiProperty({ required: false })
  description?: string;

  static fromEntity(entity: TeamEntity): TeamResponseDto {
    const dto = new TeamResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    if (entity.fieldOfAction) {
      dto.fieldOfAction = entity.fieldOfAction;
    }
    if (entity.photo) {
      dto.photo = entity.photo;
    }
    if (entity.managerId) {
      dto.managerId = entity.managerId;
    }
    if (entity.color) {
      dto.color = entity.color;
    }
    if (entity.description) {
      dto.description = entity.description;
    }
    return dto;
  }

  static fromEntityWithDetails(entity: TeamWithDetails): TeamResponseDto {
    const dto = new TeamResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;

    if (entity.fieldOfAction) {
      dto.fieldOfAction = entity.fieldOfAction;
    }
    if (entity.photo) {
      dto.photo = entity.photo;
    }
    if (entity.managerId) {
      dto.managerId = entity.managerId;
    }
    if (entity.manager) {
      dto.manager = TeamMemberInfoDto.fromData(entity.manager);
    }
    if (entity.membersDetails && entity.membersDetails.length > 0) {
      dto.members = entity.membersDetails.map(TeamMemberInfoDto.fromData);
    }
    if (entity.color) {
      dto.color = entity.color;
    }
    if (entity.description) {
      dto.description = entity.description;
    }

    return dto;
  }
}
