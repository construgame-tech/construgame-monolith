// Use Case: Autenticar usuário com telefone e código de autenticação

import {
  activateUserEntity,
  canReuseAuthCode,
  clearAuthCode,
  isAuthCodeValid,
  setAuthCode,
  UserEntity,
} from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

// Passo 1: Gerar e enviar código de autenticação
export interface GenerateAuthCodeInput {
  phone: string;
  authCode: string; // Código gerado pela camada de aplicação
  expiresAt: string; // Data de expiração
}

export interface GenerateAuthCodeOutput {
  user: UserEntity;
  codeGenerated: boolean;
  codeReused: boolean; // Indica se o código já existente foi reutilizado
}

export const generateAuthCode = async (
  input: GenerateAuthCodeInput,
  userRepository: IUserRepository,
): Promise<GenerateAuthCodeOutput> => {
  // Busca o usuário por telefone
  const user = await userRepository.findByPhone(input.phone);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Verifica se pode reutilizar o código existente
  if (canReuseAuthCode(user)) {
    return {
      user,
      codeGenerated: true,
      codeReused: true,
    };
  }

  // Define um novo código de autenticação
  const updatedUser = setAuthCode(user, input.authCode, input.expiresAt);

  // Persiste apenas o authCode sem disparar eventos
  await userRepository.updateAuthCodeOnly(
    user.id,
    input.authCode,
    input.expiresAt,
  );

  return {
    user: updatedUser,
    codeGenerated: true,
    codeReused: false,
  };
};

// Passo 2: Validar código de autenticação e autenticar
export interface ValidateAuthCodeInput {
  phone: string;
  authCode: string;
}

export interface ValidateAuthCodeOutput {
  user: UserEntity;
}

export const validateAuthCode = async (
  input: ValidateAuthCodeInput,
  userRepository: IUserRepository,
): Promise<ValidateAuthCodeOutput> => {
  // Busca o usuário por telefone
  const user = await userRepository.findByPhone(input.phone);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Valida o código de autenticação
  if (!isAuthCodeValid(user, input.authCode)) {
    throw new Error("Invalid credentials");
  }

  // Remove o authCode após validação
  let updatedUser = clearAuthCode(user);

  // Se o usuário estava aguardando confirmação, ativa
  if (user.status === "WAITING_CONFIRMATION") {
    updatedUser = activateUserEntity(updatedUser);
    // Salva com eventos (para disparar evento de ativação)
    await userRepository.save(updatedUser);
  } else {
    // Salva sem eventos (apenas remove o authCode)
    await userRepository.saveWithoutEvents(updatedUser);
  }

  return { user: updatedUser };
};
