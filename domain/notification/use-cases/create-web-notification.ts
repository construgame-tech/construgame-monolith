// Use Case: Criar uma nova notificação web

import { randomUUID } from "crypto";
import {
  createWebNotificationEntity,
  KaizenCompletedData,
  validateWebNotificationData,
  WebNotificationEntity,
  WebNotificationType,
} from "../entities/web-notification.entity";
import { IWebNotificationRepository } from "../repositories/web-notification.repository.interface";

export interface CreateWebNotificationInput {
  userId: string;
  organizationId: string;
  type: WebNotificationType;
  kaizenCompletedData?: KaizenCompletedData;
}

export interface CreateWebNotificationOutput {
  notification: WebNotificationEntity;
}

export const createWebNotification = async (
  input: CreateWebNotificationInput,
  webNotificationRepository: IWebNotificationRepository,
): Promise<CreateWebNotificationOutput> => {
  // Valida os dados da notificação
  validateWebNotificationData(input.type, input.kaizenCompletedData);

  // Gera ID único e timestamp
  const notificationId = randomUUID();
  const createdDate = new Date().toISOString();

  // Cria a entidade de domínio
  const notification = createWebNotificationEntity({
    id: notificationId,
    userId: input.userId,
    organizationId: input.organizationId,
    type: input.type,
    createdDate,
    kaizenCompletedData: input.kaizenCompletedData,
  });

  // Persiste no repositório
  await webNotificationRepository.save(notification);

  return { notification };
};
