import type {
  LeagueEntity,
  LeaguePrize,
  LeagueStatus,
} from "@domain/league/entities/league.entity";
import { ApiProperty } from "@nestjs/swagger";

export class LeagueResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  responsibleId: string;

  @ApiProperty({ enum: ["ACTIVE", "ARCHIVED", "DONE", "PAUSED"] })
  status: LeagueStatus;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  photo?: string;

  @ApiProperty({ required: false })
  objective?: string;

  @ApiProperty({ required: false })
  startDate?: string;

  @ApiProperty({ required: false })
  endDate?: string;

  @ApiProperty({ type: [Object], required: false })
  prizes?: LeaguePrize[];

  @ApiProperty({ type: [String], required: false })
  projects?: string[];

  @ApiProperty({ type: [String], required: false })
  games?: string[];

  @ApiProperty({ required: false })
  hidden?: boolean;

  @ApiProperty()
  sequence: number;

  static fromEntity(entity: LeagueEntity): LeagueResponseDto {
    const dto = new LeagueResponseDto();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.responsibleId = entity.responsibleId;
    dto.status = entity.status;
    dto.name = entity.name;
    dto.photo = entity.photo;
    dto.objective = entity.objective;
    dto.startDate = entity.startDate;
    dto.endDate = entity.endDate;
    dto.prizes = entity.prizes;
    dto.projects = entity.projects;
    dto.games = entity.games;
    dto.hidden = entity.hidden;
    dto.sequence = entity.sequence;
    return dto;
  }
}
