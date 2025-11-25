import {
  WebNotificationEntity,
  WebNotificationStatus,
} from "@domain/notification/entities/web-notification.entity";
import type { IWebNotificationRepository } from "@domain/notification/repositories/web-notification.repository.interface";
import {
  CreateWebNotificationInput,
  createWebNotification,
} from "@domain/notification/use-cases/create-web-notification";
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
    // Update cada notificação individualmente
    for (const id of notificationIds) {
      const notification = await this.notificationRepository.findById(id);
      if (
        notification &&
        notification.userId === userId &&
        notification.organizationId === organizationId
      ) {
        notification.status = "READ";
        await this.notificationRepository.save(notification);
      }
    }
  }
}
