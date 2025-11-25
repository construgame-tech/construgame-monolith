import type {
  KaizenAttachment,
  KaizenBenefit,
  KaizenEntity,
  KaizenResponsibles,
  KaizenStatus,
  KaizenTask,
} from "@domain/kaizen/entities/kaizen.entity";
import { ApiProperty } from "@nestjs/swagger";

export class KaizenResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  gameId: string;

  @ApiProperty({ enum: ["ACTIVE", "DONE", "APPROVED", "ARCHIVED"] })
  status: KaizenStatus;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdDate: string;

  @ApiProperty({ required: false })
  updatedDate?: string;

  @ApiProperty()
  sequence: number;

  @ApiProperty({ required: false })
  originalKaizenId?: string;

  @ApiProperty({ required: false })
  leaderId?: string;

  @ApiProperty({ required: false })
  teamId?: string;

  @ApiProperty({ required: false })
  category?: number;

  @ApiProperty({ required: false })
  kaizenTypeId?: string;

  @ApiProperty({ required: false })
  kaizenIdeaId?: string;

  @ApiProperty({ type: Object, required: false })
  responsibles?: KaizenResponsibles;

  @ApiProperty({ required: false })
  currentSituation?: string;

  @ApiProperty({ type: [String], required: false })
  currentSituationImages?: string[];

  @ApiProperty({ required: false })
  solution?: string;

  @ApiProperty({ type: [String], required: false })
  solutionImages?: string[];

  @ApiProperty({ type: [Object], required: false })
  tasks?: KaizenTask[];

  @ApiProperty({ type: [Object], required: false })
  benefits?: KaizenBenefit[];

  @ApiProperty({ required: false })
  resources?: string;

  @ApiProperty({ type: [String], required: false })
  files?: string[];

  @ApiProperty({ type: [Object], required: false })
  attachments?: KaizenAttachment[];

  @ApiProperty({ type: [String], required: false })
  replicas?: string[];

  static fromEntity(entity: KaizenEntity): KaizenResponseDto {
    const dto = new KaizenResponseDto();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.projectId = entity.projectId;
    dto.gameId = entity.gameId;
    dto.status = entity.status;
    dto.name = entity.name;
    dto.createdDate = entity.createdDate;
    dto.updatedDate = entity.updatedDate;
    dto.sequence = entity.sequence;
    dto.originalKaizenId = entity.originalKaizenId;
    dto.leaderId = entity.leaderId;
    dto.teamId = entity.teamId;
    dto.category = entity.category;
    dto.kaizenTypeId = entity.kaizenTypeId;
    dto.kaizenIdeaId = entity.kaizenIdeaId;
    dto.responsibles = entity.responsibles;
    dto.currentSituation = entity.currentSituation;
    dto.currentSituationImages = entity.currentSituationImages;
    dto.solution = entity.solution;
    dto.solutionImages = entity.solutionImages;
    dto.tasks = entity.tasks;
    dto.benefits = entity.benefits;
    dto.resources = entity.resources;
    dto.files = entity.files;
    dto.attachments = entity.attachments;
    dto.replicas = entity.replicas;
    return dto;
  }
}
