import type {
  ProjectEntity,
  ProjectPrize,
  ProjectStatus,
} from "@domain/project/entities/project.entity";
import { ApiProperty } from "@nestjs/swagger";

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String], required: false })
  responsibles?: string[];

  @ApiProperty({ enum: ["ACTIVE", "PAUSED", "DONE"] })
  status: ProjectStatus;

  @ApiProperty({ required: false })
  activeGameId?: string;

  @ApiProperty({ required: false })
  photo?: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  state?: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  startDate?: string;

  @ApiProperty({ required: false })
  endDate?: string;

  @ApiProperty({ type: [Object], required: false })
  prizes?: ProjectPrize[];

  @ApiProperty({ type: [String], required: false })
  teams?: string[];

  @ApiProperty()
  sequence: number;

  static fromEntity(entity: ProjectEntity): ProjectResponseDto {
    const dto = new ProjectResponseDto();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.name = entity.name;
    dto.responsibles = entity.responsibles;
    dto.status = entity.status;
    dto.activeGameId = entity.activeGameId;
    dto.photo = entity.photo;
    dto.type = entity.type;
    dto.state = entity.state;
    dto.city = entity.city;
    dto.startDate = entity.startDate;
    dto.endDate = entity.endDate;
    dto.prizes = entity.prizes;
    dto.teams = entity.teams;
    dto.sequence = entity.sequence;
    return dto;
  }
}
