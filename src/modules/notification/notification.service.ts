import {
  WebNotificationEntity,
  WebNotificationStatus,
} from "@domain/notification/entities/web-notification.entity";
import type { IWebNotificationRepository } from "@domain/notification/repositories/web-notification.repository.interface";
import {
  CreateWebNotificationInput,
  createWebNotification,
} from "@domain/notification/use-cases/create-web-notification";
import { markNotificationsAsRead } from "@domain/notification/use-cases/mark-notifications-as-read";
import { readWebNotifications } from "@domain/notification/use-cases/read-web-notifications";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class NotificationService {
  constructor(
    @Inject("IWebNotificationRepository")
    private readonly notificationRepository: IWebNotificationRepository,
  ) {}

  async createWebNotification(
    input: CreateWebNotificationInput,
  ): Promise<WebNotificationEntity> {
    const result = await createWebNotification(
      input,
      this.notificationRepository,
    );
    return result.notification;
  }

  async readWebNotifications(
    organizationId: string,
    userId: string,
    status?: WebNotificationStatus,
  ): Promise<{
    notifications: WebNotificationEntity[];
    paginationKey?: string;
  }> {
    const result = await readWebNotifications(
      { organizationId, userId, status },
      this.notificationRepository,
    );
    return result;
  }

  async markNotificationsAsRead(
    userId: string,
    organizationId: string,
    notificationIds: string[],
  ): Promise<void> {
    await markNotificationsAsRead(
      { userId, organizationId, notificationIds },
      this.notificationRepository,
    );
  }
}
