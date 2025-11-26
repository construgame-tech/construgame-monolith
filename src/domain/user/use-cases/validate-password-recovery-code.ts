// Use Case: Validar código de recuperação de senha

import { isPasswordRecoveryCodeValid } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface ValidatePasswordRecoveryCodeInput {
  userId: string;
  recoveryCode: string;
}

export interface ValidatePasswordRecoveryCodeOutput {
  isValid: boolean;
}

export const validatePasswordRecoveryCode = async (
  input: ValidatePasswordRecoveryCodeInput,
  userRepository: IUserRepository,
): Promise<ValidatePasswordRecoveryCodeOutput> => {
  // Busca o usuário
  const user = await userRepository.findById(input.userId);

  if (!user) {
    return { isValid: false };
  }

  // Valida o código
  const isValid = isPasswordRecoveryCodeValid(user, input.recoveryCode);

  return { isValid };
};
