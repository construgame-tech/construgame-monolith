// Use Case: Atualizar um usuário existente

import { UserEntity, updateUserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface UpdateUserInput {
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  photo?: string;
  customId?: string;
  signedTermsOfUse?: boolean;
}

export interface UpdateUserOutput {
  user: UserEntity;
}

export const updateUser = async (
  input: UpdateUserInput,
  userRepository: IUserRepository,
): Promise<UpdateUserOutput> => {
  // Busca o usuário atual
  const currentUser = await userRepository.findById(input.userId);

  if (!currentUser) {
    throw new Error(`User not found: ${input.userId}`);
  }

  // Valida que o email é único (se estiver sendo alterado)
  if (input.email && input.email !== currentUser.email) {
    const existingUserByEmail = await userRepository.findByEmail(input.email);
    if (existingUserByEmail) {
      throw new Error("Email already exists");
    }
  }

  // Valida que o telefone é único (se estiver sendo alterado)
  if (input.phone && input.phone !== currentUser.phone) {
    const existingUserByPhone = await userRepository.findByPhone(input.phone);
    if (existingUserByPhone) {
      throw new Error("Phone already exists");
    }
  }

  // Atualiza a entidade de domínio
  const updatedUser = updateUserEntity(currentUser, {
    name: input.name,
    email: input.email,
    phone: input.phone,
    nickname: input.nickname,
    photo: input.photo,
    customId: input.customId,
    signedTermsOfUse: input.signedTermsOfUse,
  });

  // Persiste no repositório
  await userRepository.save(updatedUser);

  return { user: updatedUser };
};
