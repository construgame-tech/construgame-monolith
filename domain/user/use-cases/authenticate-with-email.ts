// Use Case: Autenticar usuário com email e senha

import { UserEntity } from "../entities/user.entity";
import { IUserRepository } from "../repositories/user.repository.interface";

export interface AuthenticateWithEmailInput {
  email: string;
  password: string; // Senha em texto plano (será comparada pela função de comparação)
}

export interface AuthenticateWithEmailOutput {
  user: UserEntity;
}

// Função de comparação de senha deve ser fornecida pela camada de infraestrutura
export type PasswordCompareFn = (
  plainPassword: string,
  hashedPassword: string,
) => Promise<boolean>;

export const authenticateWithEmail = async (
  input: AuthenticateWithEmailInput,
  userRepository: IUserRepository,
  comparePassword: PasswordCompareFn,
): Promise<AuthenticateWithEmailOutput> => {
  // Busca o usuário por email
  const user = await userRepository.findByEmail(input.email);

  if (!user || !user.password) {
    throw new Error("Invalid credentials");
  }

  // Valida a senha usando a função de comparação fornecida
  const isPasswordValid = await comparePassword(input.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return { user };
};
