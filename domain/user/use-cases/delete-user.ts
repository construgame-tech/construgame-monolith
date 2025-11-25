// Use Case: Deletar um usuário

import { incrementUserSequence, UserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface DeleteUserInput {
  userId: string;
}

export interface DeleteUserOutput {
  deleted: boolean;
}

export const deleteUser = async (
  input: DeleteUserInput,
  userRepository: IUserRepository,
): Promise<DeleteUserOutput> => {
  // Busca o usuário
  const user = await userRepository.findById(input.userId);

  if (!user) {
    // Retorna sucesso mesmo se o usuário não existir (idempotência)
    return { deleted: false };
  }

  // Incrementa a sequence antes de deletar
  const userToDelete = incrementUserSequence(user);

  // Remove o usuário
  await userRepository.delete(userToDelete);

  return { deleted: true };
};
