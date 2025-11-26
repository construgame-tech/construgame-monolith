// Interface do repositório de WebNotification
// Define o contrato para persistência, sem implementação

import {
  WebNotificationEntity,
  WebNotificationStatus,
} from "../entities/web-notification.entity";

export interface WebNotificationListResult {
  notifications: WebNotificationEntity[];
  paginationKey?: string;
}

export interface IWebNotificationRepository {
  // Persiste uma notificação (create ou update)
  save(notification: WebNotificationEntity): Promise<void>;

  // Busca uma notificação por ID
  findById(notificationId: string): Promise<WebNotificationEntity | null>;

  // Lista notificações de um usuário com filtro opcional de status
  findByUser(
    organizationId: string,
    userId: string,
    status?: WebNotificationStatus,
  ): Promise<WebNotificationListResult>;
}
