// Use Case: Ativar um usuário

import { activateUserEntity, UserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface ActivateUserInput {
  userId: string;
}

export interface ActivateUserOutput {
  user: UserEntity;
}

export const activateUser = async (
  input: ActivateUserInput,
  userRepository: IUserRepository,
): Promise<ActivateUserOutput> => {
  // Busca o usuário
  const user = await userRepository.findById(input.userId);

  if (!user) {
    throw new Error(`User not found: ${input.userId}`);
  }

  // Ativa o usuário
  const updatedUser = activateUserEntity(user);

  // Persiste no repositório
  await userRepository.save(updatedUser);

  return { user: updatedUser };
};
