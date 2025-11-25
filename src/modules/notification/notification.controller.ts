import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateWebNotificationDto } from "./dto/create-web-notification.dto";
import { MarkAsReadDto } from "./dto/mark-as-read.dto";
import { WebNotificationResponseDto } from "./dto/web-notification-response.dto";
import { NotificationService } from "./notification.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationController {
  constructor(
    @Inject(NotificationService)
    private readonly notificationService: NotificationService,
  ) {}

  @Post("web")
  @ApiOperation({ summary: "Create a web notification" })
  @ApiResponse({ status: 201, type: WebNotificationResponseDto })
  async createWebNotification(
    @Body() dto: CreateWebNotificationDto,
  ): Promise<WebNotificationResponseDto> {
    const notification =
      await this.notificationService.createWebNotification(dto);
    return WebNotificationResponseDto.fromEntity(notification);
  }

  @Get("web")
  @ApiOperation({ summary: "List web notifications for current user" })
  @ApiQuery({ name: "organizationId", required: true })
  @ApiQuery({ name: "status", required: false, enum: ["UNREAD", "READ"] })
  @ApiResponse({ status: 200, type: [WebNotificationResponseDto] })
  async listWebNotifications(
    @Query("organizationId") organizationId: string,
    @Query("status") status?: "UNREAD" | "READ",
    @CurrentUser() user?: any,
  ): Promise<{
    notifications: WebNotificationResponseDto[];
    paginationKey?: string;
  }> {
    const userId = user?.userId || "current-user-id"; // TODO: Get from JWT
    const result = await this.notificationService.readWebNotifications(
      organizationId,
      userId,
      status,
    );
    return {
      notifications: result.notifications.map(
        WebNotificationResponseDto.fromEntity,
      ),
      paginationKey: result.paginationKey,
    };
  }

  @Post("web/read")
  @ApiOperation({ summary: "Mark notifications as read" })
  @ApiResponse({ status: 204 })
  async markAsRead(
    @Body() dto: MarkAsReadDto,
    @CurrentUser() user?: any,
  ): Promise<void> {
    const userId = user?.userId || "current-user-id"; // TODO: Get from JWT
    await this.notificationService.markNotificationsAsRead(
      userId,
      dto.organizationId,
      dto.notificationIds,
    );
  }
}
