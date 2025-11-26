// Use Case: Iniciar recuperação de senha

import { setPasswordRecoveryCode, UserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface RecoverPasswordInput {
  email: string;
  recoveryCode: string; // Código de recuperação gerado pela camada de aplicação
  expiresAt?: string; // Data de expiração opcional
}

export interface RecoverPasswordOutput {
  user: UserEntity | null;
  codeGenerated: boolean;
}

export const recoverPassword = async (
  input: RecoverPasswordInput,
  userRepository: IUserRepository,
): Promise<RecoverPasswordOutput> => {
  // Busca o usuário por email
  const user = await userRepository.findByEmail(input.email);

  if (!user || !user.email) {
    // Não revela se o usuário existe ou não (segurança)
    return { user: null, codeGenerated: false };
  }

  // Define o código de recuperação
  const updatedUser = setPasswordRecoveryCode(
    user,
    input.recoveryCode,
    input.expiresAt,
  );

  // Persiste no repositório
  await userRepository.save(updatedUser);

  return { user: updatedUser, codeGenerated: true };
};
