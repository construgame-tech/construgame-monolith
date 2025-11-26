// Use Case: Listar notificações web de um usuário

import {
  WebNotificationEntity,
  WebNotificationStatus,
} from "../entities/web-notification.entity";
import { IWebNotificationRepository } from "../repositories/web-notification.repository.interface";

export interface ReadWebNotificationsInput {
  organizationId: string;
  userId: string;
  status?: WebNotificationStatus;
}

export interface ReadWebNotificationsOutput {
  notifications: WebNotificationEntity[];
  paginationKey?: string;
}

export const readWebNotifications = async (
  input: ReadWebNotificationsInput,
  webNotificationRepository: IWebNotificationRepository,
): Promise<ReadWebNotificationsOutput> => {
  // Busca notificações no repositório
  const result = await webNotificationRepository.findByUser(
    input.organizationId,
    input.userId,
    input.status,
  );

  return {
    notifications: result.notifications,
    paginationKey: result.paginationKey,
  };
};
