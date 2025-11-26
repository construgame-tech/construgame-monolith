// Use Case: Alterar senha do usuário

import {
  activateUserEntity,
  isPasswordRecoveryCodeValid,
  UserEntity,
  updateUserPassword,
} from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface ChangePasswordInput {
  userId: string;
  recoveryCode: string;
  hashedPassword: string; // Senha já deve vir hasheada da camada de aplicação
}

export interface ChangePasswordOutput {
  user: UserEntity;
}

export const changePassword = async (
  input: ChangePasswordInput,
  userRepository: IUserRepository,
): Promise<ChangePasswordOutput> => {
  // Busca o usuário
  const user = await userRepository.findById(input.userId);

  if (!user) {
    throw new Error(`User not found: ${input.userId}`);
  }

  // Valida o código de recuperação
  if (!isPasswordRecoveryCodeValid(user, input.recoveryCode)) {
    throw new Error("Invalid password recovery code");
  }

  // Atualiza a senha (e remove o código de recuperação)
  let updatedUser = updateUserPassword(user, input.hashedPassword);

  // Se o usuário estava aguardando confirmação, ativa o usuário
  if (user.status === "WAITING_CONFIRMATION") {
    updatedUser = activateUserEntity(updatedUser);
  }

  // Persiste no repositório
  await userRepository.save(updatedUser);

  return { user: updatedUser };
};
