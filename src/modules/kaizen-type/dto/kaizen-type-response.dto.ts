import type { KaizenTypeEntity } from "@domain/kaizen-type/entities/kaizen-type.entity";
import { ApiProperty } from "@nestjs/swagger";

export class KaizenTypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  points: number;

  @ApiProperty({ required: false })
  ideaPoints?: number;

  @ApiProperty({ required: false })
  ideaExecutionPoints?: number;

  @ApiProperty()
  sequence: number;

  static fromEntity(entity: KaizenTypeEntity): KaizenTypeResponseDto {
    const dto = new KaizenTypeResponseDto();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.points = entity.points;
    dto.ideaPoints = entity.ideaPoints;
    dto.ideaExecutionPoints = entity.ideaExecutionPoints;
    return dto;
  }
}
