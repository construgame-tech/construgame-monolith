import type {
  KaizenIdeaAttachment,
  KaizenIdeaAuthors,
  KaizenIdeaBenefit,
  KaizenIdeaEntity,
  KaizenIdeaNonExecutableProject,
  KaizenIdeaProblem,
  KaizenIdeaSolution,
  KaizenIdeaStatus,
  KaizenIdeaTask,
} from "@domain/kaizen-idea/entities/kaizen-idea.entity";
import { ApiProperty } from "@nestjs/swagger";

export class KaizenIdeaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty({ required: false })
  projectId?: string;

  @ApiProperty({ required: false })
  gameId?: string;

  @ApiProperty({ required: false })
  kaizenTypeId?: string;

  @ApiProperty({ enum: ["DRAFT", "APPROVED", "ARCHIVED"] })
  status: KaizenIdeaStatus;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  isRecommended?: boolean;

  @ApiProperty({ type: Object, required: false })
  authors?: KaizenIdeaAuthors;

  @ApiProperty({ type: Object, required: false })
  problem?: KaizenIdeaProblem;

  @ApiProperty({ type: Object, required: false })
  solution?: KaizenIdeaSolution;

  @ApiProperty({ type: [Object], required: false })
  tasks?: KaizenIdeaTask[];

  @ApiProperty({ type: [Object], required: false })
  benefits?: KaizenIdeaBenefit[];

  @ApiProperty({ type: [Object], required: false })
  attachments?: KaizenIdeaAttachment[];

  @ApiProperty()
  createdDate: string;

  @ApiProperty({ required: false })
  updatedDate?: string;

  @ApiProperty()
  sequence: number;

  @ApiProperty({ type: [String], required: false })
  executableKaizenProjectIds?: string[];

  @ApiProperty({ type: [Object], required: false })
  nonExecutableProjects?: KaizenIdeaNonExecutableProject[];

  static fromEntity(entity: KaizenIdeaEntity): KaizenIdeaResponseDto {
    const dto = new KaizenIdeaResponseDto();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.projectId = entity.projectId;
    dto.gameId = entity.gameId;
    dto.kaizenTypeId = entity.kaizenTypeId;
    dto.status = entity.status;
    dto.name = entity.name;
    dto.isRecommended = entity.isRecommended;
    dto.authors = entity.authors;
    dto.problem = entity.problem;
    dto.solution = entity.solution;
    dto.tasks = entity.tasks;
    dto.benefits = entity.benefits;
    dto.attachments = entity.attachments;
    dto.createdDate = entity.createdDate;
    dto.updatedDate = entity.updatedDate;
    dto.executableKaizenProjectIds = entity.executableKaizenProjectIds;
    dto.nonExecutableProjects = entity.nonExecutableProjects;
    return dto;
  }
}
