import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createToken, faker, postRequest } from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("AuthController (e2e)", () => {
  let app: NestFastifyApplication;
  let userId: string;
  let organizationId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    userId = faker.uuid();
    organizationId = faker.uuid();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("POST /api/v1/auth/web/refresh", () => {
    it("should return 400 when refreshToken is missing", async () => {
      // Act
      const response = await postRequest(app, "/api/v1/auth/web/refresh", {
        body: {},
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when refreshToken is empty string", async () => {
      // Act
      const response = await postRequest(app, "/api/v1/auth/web/refresh", {
        body: { refreshToken: "" },
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 401 when refreshToken is invalid", async () => {
      // Act
      const response = await postRequest(app, "/api/v1/auth/web/refresh", {
        body: { refreshToken: "invalid-token" },
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return 401 when refreshToken is expired", async () => {
      // Arrange - Create an expired token (negative expiration)
      const jwt = await import("jsonwebtoken");
      const expiredToken = jwt.sign(
        { sub: userId, organizationId },
        process.env.JWT_SECRET || "test_jwt_secret_key_for_testing_only",
        { expiresIn: "-1h" },
      );

      // Act
      const response = await postRequest(app, "/api/v1/auth/web/refresh", {
        body: { refreshToken: expiredToken },
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return new tokens when refreshToken is valid", async () => {
      // Arrange - Create a valid refresh token
      const validToken = createToken(userId, organizationId);

      // Act
      const response = await postRequest(app, "/api/v1/auth/web/refresh", {
        body: { refreshToken: validToken },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });
  });

  describe("POST /api/v1/auth/app/refresh", () => {
    it("should return 400 when refreshToken is missing", async () => {
      // Act
      const response = await postRequest(app, "/api/v1/auth/app/refresh", {
        body: {},
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when refreshToken is empty string", async () => {
      // Act
      const response = await postRequest(app, "/api/v1/auth/app/refresh", {
        body: { refreshToken: "" },
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 401 when refreshToken is invalid", async () => {
      // Act
      const response = await postRequest(app, "/api/v1/auth/app/refresh", {
        body: { refreshToken: "invalid-token" },
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return 401 when refreshToken is expired", async () => {
      // Arrange - Create an expired token
      const jwt = await import("jsonwebtoken");
      const expiredToken = jwt.sign(
        { sub: userId, organizationId },
        process.env.JWT_SECRET || "test_jwt_secret_key_for_testing_only",
        { expiresIn: "-1h" },
      );

      // Act
      const response = await postRequest(app, "/api/v1/auth/app/refresh", {
        body: { refreshToken: expiredToken },
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return new tokens when refreshToken is valid", async () => {
      // Arrange - Create a valid refresh token
      const validToken = createToken(userId, organizationId);

      // Act
      const response = await postRequest(app, "/api/v1/auth/app/refresh", {
        body: { refreshToken: validToken },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });
  });

  describe("POST /api/v1/auth/sso/microsoft", () => {
    it("should return 400 when code is missing", async () => {
      // Act
      const response = await postRequest(app, "/api/v1/auth/sso/microsoft", {
        body: {},
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when code is empty string", async () => {
      // Act
      const response = await postRequest(app, "/api/v1/auth/sso/microsoft", {
        body: { code: "" },
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for SSO not implemented (stub)", async () => {
      // Arrange
      const ssoCode = "valid-microsoft-sso-code";

      // Act
      const response = await postRequest(app, "/api/v1/auth/sso/microsoft", {
        body: { code: ssoCode },
      });

      // Assert
      // The stub implementation throws BadRequestException
      expect(response.statusCode).toBe(400);
    });
  });
});
