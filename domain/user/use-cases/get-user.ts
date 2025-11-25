// Use Case: Buscar um usuário por ID

import { UserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface GetUserInput {
  userId: string;
}

export interface GetUserOutput {
  user: UserEntity;
}

export const getUser = async (
  input: GetUserInput,
  userRepository: IUserRepository,
): Promise<GetUserOutput> => {
  // Busca o usuário
  const user = await userRepository.findById(input.userId);

  if (!user) {
    throw new Error(`User not found: ${input.userId}`);
  }

  return { user };
};
