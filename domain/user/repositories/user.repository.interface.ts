// Interface do repositório de User
// Define o contrato para persistência, sem implementação
// A implementação real será feita na camada de infraestrutura (DynamoDB, Postgres + Drizzle, etc)

import { UserEntity } from "../entities/user.entity";

export interface IUserRepository {
  // Persiste um usuário (create ou update)
  save(user: UserEntity): Promise<void>;

  // Remove um usuário
  delete(user: UserEntity): Promise<void>;

  // Busca um usuário por ID
  findById(userId: string): Promise<UserEntity | null>;

  // Busca um usuário por email
  findByEmail(email: string): Promise<UserEntity | null>;

  // Busca um usuário por telefone
  findByPhone(phone: string): Promise<UserEntity | null>;

  // Atualiza apenas authCode e expiração (sem incrementar sequence ou disparar eventos)
  // Usado durante o processo de login via telefone
  updateAuthCodeOnly(
    userId: string,
    authCode?: string,
    authCodeExpiresAt?: string,
  ): Promise<void>;

  // Atualiza o usuário sem disparar eventos (usado em casos específicos como login)
  saveWithoutEvents(user: UserEntity): Promise<void>;
}
