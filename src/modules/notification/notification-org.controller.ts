import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { WebNotificationResponseDto } from "./dto/web-notification-response.dto";
import { NotificationService } from "./notification.service";

/**
 * Controller para rotas de notification compatíveis com openapi.yaml
 * Path: /organization/{organizationId}/user/{userId}/notification
 */
@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization")
export class NotificationOrgController {
  constructor(
    @Inject(NotificationService)
    private readonly notificationService: NotificationService,
  ) {}

  @Get(":organizationId/user/:userId/notification")
  @ApiOperation({ summary: "List user notifications" })
  @ApiParam({
    name: "organizationId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["UNREAD", "READ", "ALL"],
    description: "Filter by notification status. Defaults to UNREAD",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Pagination limit",
  })
  @ApiQuery({
    name: "paginationKey",
    required: false,
    description: "Pagination key for next page",
  })
  @ApiResponse({ status: 200 })
  async listUserNotifications(
    @Param("organizationId") organizationId: string,
    @Param("userId") userId: string,
    @Query("status") status?: "UNREAD" | "READ" | "ALL",
    @Query("limit") limit?: number,
    @Query("paginationKey") paginationKey?: string,
  ): Promise<{
    items: WebNotificationResponseDto[];
    paginationKey?: string;
  }> {
    // Converte "ALL" para undefined para buscar todos
    const statusFilter =
      status === "ALL" ? undefined : (status as "UNREAD" | "READ" | undefined);

    const result = await this.notificationService.readWebNotifications(
      organizationId,
      userId,
      statusFilter,
    );

    return {
      items: result.notifications.map(WebNotificationResponseDto.fromEntity),
      paginationKey: result.paginationKey,
    };
  }

  @Put(":organizationId/user/:userId/notification/:notificationId/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark notification as read" })
  @ApiParam({
    name: "organizationId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiParam({
    name: "notificationId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, description: "Notification marked as read" })
  async markAsRead(
    @Param("organizationId") organizationId: string,
    @Param("userId") userId: string,
    @Param("notificationId") notificationId: string,
  ): Promise<{ success: boolean }> {
    await this.notificationService.markNotificationsAsRead(
      userId,
      organizationId,
      [notificationId],
    );
    return { success: true };
  }
}
