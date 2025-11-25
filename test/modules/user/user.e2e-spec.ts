import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createToken,
  deleteRequest,
  faker,
  getRequest,
  postRequest,
  putRequest,
} from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("UserController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let userId: string;
  let organizationId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    userId = faker.uuid();
    organizationId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("POST /api/v1/users", () => {
    it("should create a new user", async () => {
      // Arrange
      const userData = {
        email: "joao.silva@test.com",
        phone: "+55 11 98765-4321",
        name: "João Silva",
        password: "senha123",
      };

      // Act
      const response = await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: userData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
      });
      expect(response.body.password).toBeUndefined();
    });

    it("should create user with minimal data", async () => {
      // Arrange
      const userData = {
        email: "minimal@test.com",
        password: "senha123",
      };

      // Act
      const response = await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: userData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.email).toBe(userData.email);
    });

    it("should return 400 when required fields are missing", async () => {
      // Arrange
      const invalidData = {
        name: "Sem Email",
      };

      // Act
      const response = await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: invalidData,
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 401 when no auth token is provided", async () => {
      // Arrange
      const userData = {
        email: "test@test.com",
        password: "senha123",
      };

      // Act
      const response = await postRequest(app, "/api/v1/users", {
        body: userData,
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("should get a user by id", async () => {
      // Arrange - Create user first
      const createResponse = await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: {
          email: "get.user@test.com",
          password: "senha123",
          name: "User para Consulta",
        },
      });

      const userId = createResponse.body.id;

      // Act
      const response = await getRequest(app, `/api/v1/users/${userId}`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: userId,
        email: "get.user@test.com",
        name: "User para Consulta",
      });
    });

    it("should return 404 when user does not exist", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await getRequest(app, `/api/v1/users/${nonExistentId}`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/users/by-email/:email", () => {
    it("should get a user by email", async () => {
      // Arrange - Create user
      const email = "find.by.email@test.com";
      await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: {
          email,
          password: "senha123",
          name: "User By Email",
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/users/by-email/${encodeURIComponent(email)}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe(email);
    });

    it("should return 404 when user with email does not exist", async () => {
      // Arrange
      const nonExistentEmail = "notfound@test.com";

      // Act
      const response = await getRequest(
        app,
        `/api/v1/users/by-email/${encodeURIComponent(nonExistentEmail)}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/users/by-phone/:phone", () => {
    it("should get a user by phone", async () => {
      // Arrange - Create user
      const phone = "+55 11 91234-5678";
      await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: {
          email: "find.by.phone@test.com",
          phone,
          password: "senha123",
          name: "User By Phone",
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/users/by-phone/${encodeURIComponent(phone)}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.phone).toBe(phone);
    });

    it("should return 404 when user with phone does not exist", async () => {
      // Arrange
      const nonExistentPhone = "+55 11 99999-9999";

      // Act
      const response = await getRequest(
        app,
        `/api/v1/users/by-phone/${encodeURIComponent(nonExistentPhone)}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("PUT /api/v1/users/:id", () => {
    it("should update a user", async () => {
      // Arrange - Create user
      const createResponse = await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: {
          email: "update.user@test.com",
          password: "senha123",
          name: "User Original",
        },
      });

      const userId = createResponse.body.id;

      // Act
      const response = await putRequest(app, `/api/v1/users/${userId}`, {
        token: authToken,
        body: {
          name: "User Atualizado",
          phone: "+55 11 98888-7777",
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe("User Atualizado");
      expect(response.body.phone).toBe("+55 11 98888-7777");
    });

    it("should return 404 when updating non-existent user", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await putRequest(app, `/api/v1/users/${nonExistentId}`, {
        token: authToken,
        body: { name: "Test" },
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /api/v1/users/:id/activate", () => {
    it("should activate a user", async () => {
      // Arrange - Create inactive user
      const createResponse = await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: {
          email: "activate.user@test.com",
          password: "senha123",
          active: false,
        },
      });

      const userId = createResponse.body.id;

      // Act
      const response = await postRequest(
        app,
        `/api/v1/users/${userId}/activate`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.active).toBe(true);
    });
  });

  describe("POST /api/v1/users/:id/superuser", () => {
    it("should make a user superuser", async () => {
      // Arrange - Create regular user
      const createResponse = await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: {
          email: "superuser.test@test.com",
          password: "senha123",
        },
      });

      const userId = createResponse.body.id;

      // Act
      const response = await postRequest(
        app,
        `/api/v1/users/${userId}/superuser`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.isSuperuser).toBe(true);
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should delete a user", async () => {
      // Arrange - Create user
      const createResponse = await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: {
          email: "delete.user@test.com",
          password: "senha123",
        },
      });

      const userId = createResponse.body.id;

      // Act
      const response = await deleteRequest(app, `/api/v1/users/${userId}`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(200);

      // Verify it was deleted
      const getResponse = await getRequest(app, `/api/v1/users/${userId}`, {
        token: authToken,
      });

      expect(getResponse.statusCode).toBe(404);
    });

    it("should return 404 when deleting non-existent user", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/users/${nonExistentId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete user lifecycle", async () => {
      // Arrange & Act - Create
      const createResponse = await postRequest(app, "/api/v1/users", {
        token: authToken,
        body: {
          email: "lifecycle@test.com",
          password: "senha123",
          name: "Lifecycle User",
          phone: "+55 11 97777-6666",
        },
      });

      expect(createResponse.statusCode).toBe(201);
      const userId = createResponse.body.id;

      // Act - Get
      const getResponse = await getRequest(app, `/api/v1/users/${userId}`, {
        token: authToken,
      });

      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.email).toBe("lifecycle@test.com");

      // Act - Update
      const updateResponse = await putRequest(app, `/api/v1/users/${userId}`, {
        token: authToken,
        body: {
          name: "Updated Lifecycle User",
        },
      });

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.body.name).toBe("Updated Lifecycle User");

      // Act - Activate
      const activateResponse = await postRequest(
        app,
        `/api/v1/users/${userId}/activate`,
        {
          token: authToken,
        },
      );

      expect(activateResponse.statusCode).toBe(200);

      // Act - Delete
      const deleteResponse = await deleteRequest(
        app,
        `/api/v1/users/${userId}`,
        {
          token: authToken,
        },
      );

      expect(deleteResponse.statusCode).toBe(200);
    });
  });
});
