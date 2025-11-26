// Use Case: Criar um novo usuário

import { randomUUID } from "node:crypto";
import { createUserEntity, UserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface CreateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  photo?: string;
  customId?: string;
  signedTermsOfUse?: boolean;
  passwordRecoveryCode?: string;
  password?: string;
}

export interface CreateUserOutput {
  user: UserEntity;
}

export const createUser = async (
  input: CreateUserInput,
  userRepository: IUserRepository,
): Promise<CreateUserOutput> => {
  // Verifica se já existe usuário com o mesmo email
  if (input.email) {
    const existingUserByEmail = await userRepository.findByEmail(input.email);
    if (existingUserByEmail) {
      // Retorna o usuário existente em vez de criar um duplicado
      return { user: existingUserByEmail };
    }
  }

  // Verifica se já existe usuário com o mesmo telefone
  if (input.phone) {
    const existingUserByPhone = await userRepository.findByPhone(input.phone);
    if (existingUserByPhone) {
      // Retorna o usuário existente em vez de criar um duplicado
      return { user: existingUserByPhone };
    }
  }

  // Gera um ID único para o novo usuário
  const userId = randomUUID();

  // Cria a entidade de domínio
  const user = createUserEntity({
    id: userId,
    name: input.name || input.email || input.phone || "User",
    email: input.email,
    phone: input.phone,
    nickname: input.nickname,
    photo: input.photo,
    customId: input.customId,
    signedTermsOfUse: input.signedTermsOfUse,
    passwordRecoveryCode: input.passwordRecoveryCode,
  });

  // Persiste no repositório
  await userRepository.save(user);

  return { user };
};
