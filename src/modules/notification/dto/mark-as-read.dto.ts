import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class MarkAsReadDto {
  @ApiProperty({ description: "Organization ID" })
  @IsString()
  organizationId: string;

  @ApiProperty({
    description: "Notification IDs to mark as read",
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  notificationIds: string[];
}
