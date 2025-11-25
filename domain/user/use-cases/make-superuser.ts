// Use Case: Tornar um usuário superusuário

import { makeUserSuperuser, UserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface MakeSuperuserInput {
  userId: string;
}

export interface MakeSuperuserOutput {
  user: UserEntity;
}

export const makeSuperuser = async (
  input: MakeSuperuserInput,
  userRepository: IUserRepository,
): Promise<MakeSuperuserOutput> => {
  // Busca o usuário
  const user = await userRepository.findById(input.userId);

  if (!user) {
    throw new Error(`User not found: ${input.userId}`);
  }

  // Torna o usuário superusuário
  const updatedUser = makeUserSuperuser(user);

  // Persiste no repositório
  await userRepository.save(updatedUser);

  return { user: updatedUser };
};
