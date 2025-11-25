// Entidade de domínio: PushToken
// Representa um token de push notification registrado para um usuário

export type PlatformType = "android" | "ios";

export interface PushTokenEntity {
  userId: string;
  pushToken: string;
  platformEndpoint: string;
  platformType?: PlatformType;
}

// Factory function para criar um novo push token
export const createPushTokenEntity = (props: {
  userId: string;
  pushToken: string;
  platformEndpoint: string;
  platformType?: PlatformType;
}): PushTokenEntity => {
  return {
    userId: props.userId,
    pushToken: props.pushToken,
    platformEndpoint: props.platformEndpoint,
    platformType: props.platformType,
  };
};

// Validação: token não pode ser vazio
export const validatePushToken = (token: string): void => {
  if (!token || token.trim().length === 0) {
    throw new Error("Push token cannot be empty");
  }
};
