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
  sequence: number;
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
    sequence: 0,
  };
};

// Factory function para atualizar um usuário existente
export const updateUserEntity = (
  currentUser: UserEntity,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    nickname?: string;
    photo?: string;
    customId?: string;
    signedTermsOfUse?: boolean;
  },
): UserEntity => {
  return {
    ...currentUser,
    name: updates.name ?? currentUser.name,
    email: updates.email ?? currentUser.email,
    phone: updates.phone ?? currentUser.phone,
    nickname: updates.nickname ?? currentUser.nickname,
    photo: updates.photo ?? currentUser.photo,
    customId: updates.customId ?? currentUser.customId,
    signedTermsOfUse: updates.signedTermsOfUse ?? currentUser.signedTermsOfUse,
    sequence: currentUser.sequence + 1,
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
    sequence: user.sequence + 1,
  };
};

// Factory function para ativar um usuário
export const activateUserEntity = (user: UserEntity): UserEntity => {
  return {
    ...user,
    status: "ACTIVE",
    sequence: user.sequence + 1,
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
    sequence: user.sequence + 1,
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
    sequence: user.sequence + 1,
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
    sequence: user.sequence + 1,
  };
};

// Incrementa a sequence para deleção
export const incrementUserSequence = (user: UserEntity): UserEntity => {
  return {
    ...user,
    sequence: user.sequence + 1,
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
