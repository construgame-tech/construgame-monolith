import type {
  KaizenCompletedData,
  WebNotificationType,
} from "@domain/notification/entities/web-notification.entity";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateWebNotificationDto {
  @ApiProperty({ description: "User ID" })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: "Organization ID" })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({ description: "Notification type", enum: ["KAIZEN_COMPLETED"] })
  @IsNotEmpty()
  @IsEnum(["KAIZEN_COMPLETED"])
  type: WebNotificationType;

  @ApiProperty({ description: "Kaizen completed data", required: false })
  @IsOptional()
  @IsObject()
  kaizenCompletedData?: KaizenCompletedData;
}
