import type { KaizenCommentEntity } from "@domain/kaizen/entities/kaizen-comment.entity";
import { ApiProperty } from "@nestjs/swagger";

export class KaizenCommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  kaizenId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: string;

  static fromEntity(entity: KaizenCommentEntity): KaizenCommentResponseDto {
    const dto = new KaizenCommentResponseDto();
    dto.id = entity.id;
    dto.kaizenId = entity.kaizenId;
    dto.userId = entity.userId;
    dto.text = entity.text;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
