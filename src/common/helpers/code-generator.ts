// Helpers compartilhados da aplicação
import { randomBytes } from "node:crypto";

/**
 * Gera um código aleatório numérico com o tamanho especificado.
 * Usa randomBytes do crypto para garantir aleatoriedade segura.
 *
 * @param length - Tamanho do código a ser gerado
 * @returns String com dígitos numéricos aleatórios
 *
 * @example
 * generateRandomCode(6) // "847291"
 * generateRandomCode(4) // "3847"
 */
export const generateRandomCode = (length: number): string => {
  const digits = "0123456789";
  let code = "";
  const randomBytesBuffer = randomBytes(length);

  for (let i = 0; i < length; i++) {
    code += digits[randomBytesBuffer[i] % 10];
  }

  return code;
};

/**
 * Gera um código de autenticação de 6 dígitos
 * @returns String com 6 dígitos numéricos aleatórios
 */
export const generateAuthCode = (): string => generateRandomCode(6);

/**
 * Gera um código de recuperação de senha de 6 dígitos
 * @returns String com 6 dígitos numéricos aleatórios
 */
export const generateRecoveryCode = (): string => generateRandomCode(6);
