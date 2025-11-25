// Interface para envio de notificações push
// Abstrai o mecanismo de envio (SNS, FCM, etc.) da lógica de domínio

import { PlatformType } from "../entities/push-token.entity";

export interface IPushNotificationSender {
  // Envia uma notificação push para um endpoint específico
  send(title: string, body: string, platformEndpoint: string): Promise<void>;

  // Cria um endpoint de plataforma para um token
  createPlatformEndpoint(
    token: string,
    platformType: PlatformType,
  ): Promise<string>;
}
