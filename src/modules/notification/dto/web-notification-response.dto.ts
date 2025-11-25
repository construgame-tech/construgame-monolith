import type {
  KaizenCompletedData,
  WebNotificationEntity,
  WebNotificationStatus,
  WebNotificationType,
} from "@domain/notification/entities/web-notification.entity";
import { ApiProperty } from "@nestjs/swagger";

export class WebNotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty({ enum: ["UNREAD", "READ"] })
  status: WebNotificationStatus;

  @ApiProperty({ enum: ["KAIZEN_COMPLETED"] })
  type: WebNotificationType;

  @ApiProperty()
  createdDate: string;

  @ApiProperty({ required: false })
  kaizenCompletedData?: KaizenCompletedData;

  static fromEntity(entity: WebNotificationEntity): WebNotificationResponseDto {
    const dto = new WebNotificationResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.organizationId = entity.organizationId;
    dto.status = entity.status;
    dto.type = entity.type;
    dto.createdDate = entity.createdDate;
    dto.kaizenCompletedData = entity.kaizenCompletedData;
    return dto;
  }
}
