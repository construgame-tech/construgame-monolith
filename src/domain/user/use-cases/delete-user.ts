// Use Case: Deletar um usuário

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

  // Remove o usuário
  await userRepository.delete(user);

  return { deleted: true };
};
