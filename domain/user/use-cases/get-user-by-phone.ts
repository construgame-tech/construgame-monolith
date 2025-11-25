// Use Case: Buscar um usuário por telefone

import { UserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface GetUserByPhoneInput {
  phone: string;
}

export interface GetUserByPhoneOutput {
  user: UserEntity | null;
}

export const getUserByPhone = async (
  input: GetUserByPhoneInput,
  userRepository: IUserRepository,
): Promise<GetUserByPhoneOutput> => {
  // Busca o usuário por telefone
  const user = await userRepository.findByPhone(input.phone);

  return { user };
};
