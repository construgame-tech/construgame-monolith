// Testes unitários para entidades do domínio User
// Testando as factory functions e regras de negócio

import { describe, it, expect } from "vitest";
import {
  createUserEntity,
  updateUserEntity,
  updateUserPassword,
  activateUserEntity,
  setPasswordRecoveryCode,
  setAuthCode,
  clearAuthCode,
  makeUserSuperuser,
  incrementUserSequence,
  isPasswordRecoveryCodeValid,
  isAuthCodeValid,
  canReuseAuthCode,
  type UserEntity,
} from "./user.entity";

describe("User Entity", () => {
  describe("createUserEntity", () => {
    it("deve criar um usuário com valores padrão", () => {
      const user = createUserEntity({
        id: "user-123",
        name: "João Silva",
      });

      expect(user.id).toBe("user-123");
      expect(user.name).toBe("João Silva");
      expect(user.status).toBe("WAITING_CONFIRMATION");
      expect(user.sequence).toBe(0);
    });

    it("deve criar usuário com campos opcionais", () => {
      const user = createUserEntity({
        id: "user-123",
        name: "João Silva",
        email: "joao@example.com",
        phone: "+5511999999999",
        nickname: "joao123",
        photo: "https://example.com/photo.jpg",
        customId: "custom-123",
        signedTermsOfUse: true,
        status: "ACTIVE",
      });

      expect(user.email).toBe("joao@example.com");
      expect(user.phone).toBe("+5511999999999");
      expect(user.nickname).toBe("joao123");
      expect(user.photo).toBe("https://example.com/photo.jpg");
      expect(user.customId).toBe("custom-123");
      expect(user.signedTermsOfUse).toBe(true);
      expect(user.status).toBe("ACTIVE");
    });
  });

  describe("updateUserEntity", () => {
    const baseUser: UserEntity = {
      id: "user-123",
      name: "Nome Original",
      status: "ACTIVE",
      sequence: 0,
    };

    it("deve atualizar o nome do usuário", () => {
      const updated = updateUserEntity(baseUser, {
        name: "Nome Atualizado",
      });

      expect(updated.name).toBe("Nome Atualizado");
      expect(updated.sequence).toBe(1);
    });

    it("deve atualizar múltiplos campos", () => {
      const updated = updateUserEntity(baseUser, {
        name: "Novo Nome",
        email: "novo@email.com",
        phone: "+5511888888888",
        nickname: "novonick",
      });

      expect(updated.name).toBe("Novo Nome");
      expect(updated.email).toBe("novo@email.com");
      expect(updated.phone).toBe("+5511888888888");
      expect(updated.nickname).toBe("novonick");
    });

    it("deve manter campos não alterados", () => {
      const userWithData: UserEntity = {
        ...baseUser,
        email: "original@email.com",
        photo: "original.jpg",
      };

      const updated = updateUserEntity(userWithData, {
        name: "Novo Nome",
      });

      expect(updated.email).toBe("original@email.com");
      expect(updated.photo).toBe("original.jpg");
    });
  });

  describe("updateUserPassword", () => {
    it("deve atualizar a senha e limpar código de recuperação", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
        passwordRecoveryCode: "123456",
        passwordRecoveryCodeExpires: "2025-12-31T00:00:00.000Z",
      };

      const updated = updateUserPassword(user, "hashedPassword123");

      expect(updated.password).toBe("hashedPassword123");
      expect(updated.passwordRecoveryCode).toBeUndefined();
      expect(updated.passwordRecoveryCodeExpires).toBeUndefined();
      expect(updated.sequence).toBe(1);
    });
  });

  describe("activateUserEntity", () => {
    it("deve ativar um usuário", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "WAITING_CONFIRMATION",
        sequence: 0,
      };

      const activated = activateUserEntity(user);

      expect(activated.status).toBe("ACTIVE");
      expect(activated.sequence).toBe(1);
    });
  });

  describe("setPasswordRecoveryCode", () => {
    it("deve definir código de recuperação de senha", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
      };

      const updated = setPasswordRecoveryCode(user, "ABC123", "2025-12-31T00:00:00.000Z");

      expect(updated.passwordRecoveryCode).toBe("ABC123");
      expect(updated.passwordRecoveryCodeExpires).toBe("2025-12-31T00:00:00.000Z");
      expect(updated.sequence).toBe(1);
    });
  });

  describe("setAuthCode", () => {
    it("deve definir código de autenticação", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
      };

      const updated = setAuthCode(user, "123456", "2025-12-31T00:00:00.000Z");

      expect(updated.authCode).toBe("123456");
      expect(updated.authCodeExpiresAt).toBe("2025-12-31T00:00:00.000Z");
      expect(updated.sequence).toBe(1);
    });
  });

  describe("clearAuthCode", () => {
    it("deve limpar código de autenticação", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
        authCode: "123456",
        authCodeExpiresAt: "2025-12-31T00:00:00.000Z",
      };

      const cleared = clearAuthCode(user);

      expect(cleared.authCode).toBeUndefined();
      expect(cleared.authCodeExpiresAt).toBeUndefined();
    });
  });

  describe("makeUserSuperuser", () => {
    it("deve tornar usuário superuser", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
        type: "user",
      };

      const superuser = makeUserSuperuser(user);

      expect(superuser.type).toBe("superuser");
      expect(superuser.sequence).toBe(1);
    });
  });

  describe("incrementUserSequence", () => {
    it("deve incrementar a sequence", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 5,
      };

      const incremented = incrementUserSequence(user);

      expect(incremented.sequence).toBe(6);
    });
  });

  describe("isPasswordRecoveryCodeValid", () => {
    it("deve retornar true se código válido", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
        passwordRecoveryCode: "ABC123",
      };

      expect(isPasswordRecoveryCodeValid(user, "ABC123")).toBe(true);
    });

    it("deve retornar false se código inválido", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
        passwordRecoveryCode: "ABC123",
      };

      expect(isPasswordRecoveryCodeValid(user, "WRONG")).toBe(false);
    });

    it("deve retornar false se não há código", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
      };

      expect(isPasswordRecoveryCodeValid(user, "ABC123")).toBe(false);
    });
  });

  describe("isAuthCodeValid", () => {
    it("deve retornar true se código válido e não expirado", () => {
      const futureDate = new Date(Date.now() + 60000).toISOString();
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
        authCode: "123456",
        authCodeExpiresAt: futureDate,
      };

      expect(isAuthCodeValid(user, "123456")).toBe(true);
    });

    it("deve retornar false se código expirado", () => {
      const pastDate = new Date(Date.now() - 60000).toISOString();
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
        authCode: "123456",
        authCodeExpiresAt: pastDate,
      };

      expect(isAuthCodeValid(user, "123456")).toBe(false);
    });

    it("deve retornar false se código errado", () => {
      const futureDate = new Date(Date.now() + 60000).toISOString();
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
        authCode: "123456",
        authCodeExpiresAt: futureDate,
      };

      expect(isAuthCodeValid(user, "WRONG")).toBe(false);
    });

    it("deve retornar false se não há código", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
      };

      expect(isAuthCodeValid(user, "123456")).toBe(false);
    });
  });

  describe("canReuseAuthCode", () => {
    it("deve retornar true se código ainda não expirou", () => {
      const futureDate = new Date(Date.now() + 60000).toISOString();
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
        authCode: "123456",
        authCodeExpiresAt: futureDate,
      };

      expect(canReuseAuthCode(user)).toBe(true);
    });

    it("deve retornar false se código expirou", () => {
      const pastDate = new Date(Date.now() - 60000).toISOString();
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
        authCode: "123456",
        authCodeExpiresAt: pastDate,
      };

      expect(canReuseAuthCode(user)).toBe(false);
    });

    it("deve retornar false se não há código", () => {
      const user: UserEntity = {
        id: "user-123",
        name: "User",
        status: "ACTIVE",
        sequence: 0,
      };

      expect(canReuseAuthCode(user)).toBe(false);
    });
  });
});
