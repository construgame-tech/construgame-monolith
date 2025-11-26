// Use Case: Buscar um usuário por email

import { UserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface GetUserByEmailInput {
  email: string;
}

export interface GetUserByEmailOutput {
  user: UserEntity | null;
}

export const getUserByEmail = async (
  input: GetUserByEmailInput,
  userRepository: IUserRepository,
): Promise<GetUserByEmailOutput> => {
  // Busca o usuário por email
  const user = await userRepository.findByEmail(input.email);

  return { user };
};
