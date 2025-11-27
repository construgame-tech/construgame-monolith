import type { TeamEntity } from "@domain/team/entities/team.entity";
import { ApiProperty } from "@nestjs/swagger";

export class TeamResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  managerId?: string;

  @ApiProperty({ required: false })
  fieldOfAction?: string;

  @ApiProperty({ type: [String], required: false })
  members?: string[];

  @ApiProperty()
  sequence: number;

  @ApiProperty({ required: false })
  photo?: string;

  @ApiProperty({ required: false })
  color?: string;

  @ApiProperty({ required: false })
  description?: string;

  static fromEntity(entity: TeamEntity): TeamResponseDto {
    const dto = new TeamResponseDto();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.name = entity.name;
    dto.managerId = entity.managerId;
    dto.fieldOfAction = entity.fieldOfAction;
    dto.members = entity.members;
    dto.photo = entity.photo;
    dto.color = entity.color;
    dto.description = entity.description;
    return dto;
  }
}
