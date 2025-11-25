import type {
  KaizenCompletedData,
  WebNotificationType,
} from "@domain/notification/entities/web-notification.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsObject, IsOptional, IsString } from "class-validator";

export class CreateWebNotificationDto {
  @ApiProperty({ description: "User ID" })
  @IsString()
  userId: string;

  @ApiProperty({ description: "Organization ID" })
  @IsString()
  organizationId: string;

  @ApiProperty({ description: "Notification type", enum: ["KAIZEN_COMPLETED"] })
  @IsEnum(["KAIZEN_COMPLETED"])
  type: WebNotificationType;

  @ApiProperty({ description: "Kaizen completed data", required: false })
  @IsOptional()
  @IsObject()
  kaizenCompletedData?: KaizenCompletedData;
}
