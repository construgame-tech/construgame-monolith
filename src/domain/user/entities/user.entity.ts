// Entidade de domínio: User
// Representa um usuário do sistema com autenticação e informações de perfil

export type UserStatus = "WAITING_CONFIRMATION" | "ACTIVE";

export type UserType = "user" | "superuser";

export interface UserEntity {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  authCode?: string;
  authCodeExpiresAt?: string;
  signedTermsOfUse?: boolean;
  nickname?: string;
  photo?: string;
  status: UserStatus;
  passwordRecoveryCode?: string;
  passwordRecoveryCodeExpires?: string;
  type?: UserType;
  customId?: string;
}

// Factory function para criar um novo usuário
export const createUserEntity = (props: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  nickname?: string;
  photo?: string;
  customId?: string;
  signedTermsOfUse?: boolean;
  passwordRecoveryCode?: string;
  status?: UserStatus;
}): UserEntity => {
  return {
    id: props.id,
    name: props.name,
    email: props.email,
    phone: props.phone,
    nickname: props.nickname,
    photo: props.photo,
    customId: props.customId,
    signedTermsOfUse: props.signedTermsOfUse,
    passwordRecoveryCode: props.passwordRecoveryCode,
    status: props.status ?? "WAITING_CONFIRMATION",
  };
};

// Factory function para atualizar um usuário existente
// Nota: Se um campo for passado como null, ele será removido (setado como undefined)
// Se um campo não for passado (undefined), mantém o valor atual
// Exceção: `name` é obrigatório, então null é tratado como "manter o valor atual"
export const updateUserEntity = (
  currentUser: UserEntity,
  updates: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    nickname?: string | null;
    photo?: string | null;
    customId?: string | null;
    signedTermsOfUse?: boolean | null;
  },
): UserEntity => {
  return {
    ...currentUser,
    // name é obrigatório, então null mantém o valor atual
    name: updates.name === null || updates.name === undefined ? currentUser.name : updates.name,
    email: updates.email === null ? undefined : (updates.email ?? currentUser.email),
    phone: updates.phone === null ? undefined : (updates.phone ?? currentUser.phone),
    nickname: updates.nickname === null ? undefined : (updates.nickname ?? currentUser.nickname),
    photo: updates.photo === null ? undefined : (updates.photo ?? currentUser.photo),
    customId: updates.customId === null ? undefined : (updates.customId ?? currentUser.customId),
    signedTermsOfUse: updates.signedTermsOfUse === null ? undefined : (updates.signedTermsOfUse ?? currentUser.signedTermsOfUse),
  };
};

// Factory function para atualizar a senha do usuário
export const updateUserPassword = (
  user: UserEntity,
  hashedPassword: string,
): UserEntity => {
  return {
    ...user,
    password: hashedPassword,
    passwordRecoveryCode: undefined,
    passwordRecoveryCodeExpires: undefined,
  };
};

// Factory function para ativar um usuário
export const activateUserEntity = (user: UserEntity): UserEntity => {
  return {
    ...user,
    status: "ACTIVE",
  };
};

// Factory function para definir código de recuperação de senha
export const setPasswordRecoveryCode = (
  user: UserEntity,
  code: string,
  expiresAt?: string,
): UserEntity => {
  return {
    ...user,
    passwordRecoveryCode: code,
    passwordRecoveryCodeExpires: expiresAt,
  };
};

// Factory function para definir código de autenticação (para login via telefone)
export const setAuthCode = (
  user: UserEntity,
  authCode: string,
  expiresAt: string,
): UserEntity => {
  return {
    ...user,
    authCode,
    authCodeExpiresAt: expiresAt,
  };
};

// Factory function para limpar código de autenticação
export const clearAuthCode = (user: UserEntity): UserEntity => {
  return {
    ...user,
    authCode: undefined,
    authCodeExpiresAt: undefined,
  };
};

// Factory function para tornar usuário superusuário
export const makeUserSuperuser = (user: UserEntity): UserEntity => {
  return {
    ...user,
    type: "superuser",
  };
};

// Validação: verifica se o código de recuperação de senha é válido
export const isPasswordRecoveryCodeValid = (
  user: UserEntity,
  code: string,
): boolean => {
  if (!user.passwordRecoveryCode) return false;
  return user.passwordRecoveryCode === code;
};

// Validação: verifica se o código de autenticação é válido
export const isAuthCodeValid = (user: UserEntity, code: string): boolean => {
  if (!user.authCode) return false;
  if (user.authCodeExpiresAt && new Date(user.authCodeExpiresAt) < new Date())
    return false;
  return user.authCode === code;
};

// Validação: verifica se o código de autenticação ainda está válido (não expirado)
export const canReuseAuthCode = (user: UserEntity): boolean => {
  if (!user.authCode || !user.authCodeExpiresAt) return false;
  return new Date(user.authCodeExpiresAt) > new Date();
};
