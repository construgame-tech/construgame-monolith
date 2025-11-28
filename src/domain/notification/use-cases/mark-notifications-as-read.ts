// Use Case: Marcar notificações como lidas

import {
  WebNotificationEntity,
  markWebNotificationAsRead,
} from "../entities/web-notification.entity";
import { IWebNotificationRepository } from "../repositories/web-notification.repository.interface";

export interface MarkNotificationsAsReadInput {
  userId: string;
  organizationId: string;
  notificationIds: string[];
}

export interface MarkNotificationsAsReadOutput {
  updatedCount: number;
}

export const markNotificationsAsRead = async (
  input: MarkNotificationsAsReadInput,
  repository: IWebNotificationRepository,
): Promise<MarkNotificationsAsReadOutput> => {
  const { userId, organizationId, notificationIds } = input;
  let updatedCount = 0;

  for (const id of notificationIds) {
    const notification = await repository.findById(id);

    // Valida que a notificação existe e pertence ao usuário/organização
    if (
      notification &&
      notification.userId === userId &&
      notification.organizationId === organizationId
    ) {
      const updated = markWebNotificationAsRead(notification);
      await repository.save(updated);
      updatedCount++;
    }
  }

  return { updatedCount };
};
