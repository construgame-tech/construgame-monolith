// Interface do repositório de PushToken
// Define o contrato para persistência, sem implementação

import { PushTokenEntity } from "../entities/push-token.entity";

export interface IPushTokenRepository {
  // Persiste um push token
  save(pushToken: PushTokenEntity): Promise<void>;

  // Remove um push token
  delete(pushToken: PushTokenEntity): Promise<void>;

  // Lista todos os tokens de um usuário
  findByUserId(userId: string): Promise<PushTokenEntity[]>;

  // Busca tokens pelo token value
  findByToken(token: string): Promise<PushTokenEntity[]>;
}
