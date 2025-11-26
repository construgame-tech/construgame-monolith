// Entidade de domínio: WebNotification
// Representa uma notificação web para usuários

export type WebNotificationStatus = "UNREAD" | "READ";

export type WebNotificationType = "KAIZEN_COMPLETED";

export interface KaizenCompletedData {
  kaizenId: string;
  kaizenName: string;
  kaizenLeaderId: string;
  gameId: string;
  gameName: string;
  projectId: string;
  projectName: string;
  leagueId?: string;
  leagueName?: string;
}

export interface WebNotificationEntity {
  id: string;
  userId: string;
  organizationId: string;
  status: WebNotificationStatus;
  type: WebNotificationType;
  createdDate: string;
  kaizenCompletedData?: KaizenCompletedData;
}

// Factory function para criar uma nova notificação
export const createWebNotificationEntity = (props: {
  id: string;
  userId: string;
  organizationId: string;
  type: WebNotificationType;
  createdDate: string;
  kaizenCompletedData?: KaizenCompletedData;
}): WebNotificationEntity => {
  return {
    id: props.id,
    userId: props.userId,
    organizationId: props.organizationId,
    status: "UNREAD",
    type: props.type,
    createdDate: props.createdDate,
    kaizenCompletedData: props.kaizenCompletedData,
  };
};

// Factory function para marcar notificação como lida
export const markWebNotificationAsRead = (
  notification: WebNotificationEntity,
): WebNotificationEntity => {
  return {
    ...notification,
    status: "READ",
  };
};

// Validação: notificação deve ter dados específicos do tipo
export const validateWebNotificationData = (
  type: WebNotificationType,
  data?: KaizenCompletedData,
): void => {
  if (type === "KAIZEN_COMPLETED" && !data) {
    throw new Error(
      "KAIZEN_COMPLETED notification requires kaizenCompletedData",
    );
  }
};
