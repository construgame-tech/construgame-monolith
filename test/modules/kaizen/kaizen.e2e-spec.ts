import type { INestApplication } from "@nestjs/common";
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

describe("KaizenController (e2e)", () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let projectId: string;
  let gameId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    userId = faker.uuid();
    organizationId = faker.uuid();
    projectId = faker.uuid();
    gameId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("POST /api/v1/organizations/:organizationId/projects/:projectId/kaizens", () => {
    it("should create a new kaizen", async () => {
      // Arrange
      const kaizenData = {
        title: "Reduzir tempo de concretagem",
        description: "Implementar novo processo para reduzir tempo",
        status: "OPEN",
        authorId: userId,
        gameId,
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/kaizens`,
        {
          token: authToken,
          body: kaizenData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: kaizenData.title,
        description: kaizenData.description,
        status: kaizenData.status,
        authorId: userId,
      });
    });

    it("should return 400 when required fields are missing", async () => {
      // Arrange
      const invalidData = {
        description: "Sem título",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/kaizens`,
        {
          token: authToken,
          body: invalidData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/kaizens/:kaizenId", () => {
    it("should get a kaizen by id", async () => {
      // Arrange - Create kaizen first
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/kaizens`,
        {
          token: authToken,
          body: {
            title: "Kaizen para Consulta",
            authorId: userId,
            gameId,
            status: "OPEN",
          },
        },
      );

      const kaizenId = createResponse.body.id;

      // Act
      const response = await getRequest(app, `/api/v1/kaizens/${kaizenId}`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: kaizenId,
        title: "Kaizen para Consulta",
      });
    });

    it("should return 404 when kaizen does not exist", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/kaizens/${nonExistentId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/games/:gameId/kaizens", () => {
    it("should list all kaizens for a game", async () => {
      // Arrange - Create at least 2 kaizens
      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/kaizens`,
        {
          token: authToken,
          body: {
            title: "Kaizen List 1",
            authorId: userId,
            gameId,
            status: "OPEN",
          },
        },
      );

      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/kaizens`,
        {
          token: authToken,
          body: {
            title: "Kaizen List 2",
            authorId: userId,
            gameId,
            status: "OPEN",
          },
        },
      );

      // Act
      const response = await getRequest(
        app,
        `/api/v1/games/${gameId}/kaizens`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("PUT /api/v1/kaizens/:kaizenId", () => {
    it("should update a kaizen", async () => {
      // Arrange - Create kaizen
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/kaizens`,
        {
          token: authToken,
          body: {
            title: "Kaizen Original",
            authorId: userId,
            gameId,
            status: "OPEN",
          },
        },
      );

      const kaizenId = createResponse.body.id;

      // Act
      const response = await putRequest(app, `/api/v1/kaizens/${kaizenId}`, {
        token: authToken,
        body: {
          title: "Kaizen Atualizado",
          status: "IN_PROGRESS",
          description: "Descrição atualizada",
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe("Kaizen Atualizado");
      expect(response.body.status).toBe("IN_PROGRESS");
    });
  });

  describe("DELETE /api/v1/kaizens/:kaizenId", () => {
    it("should delete a kaizen", async () => {
      // Arrange - Create kaizen
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/kaizens`,
        {
          token: authToken,
          body: {
            title: "Kaizen para Deletar",
            authorId: userId,
            gameId,
            status: "OPEN",
          },
        },
      );

      const kaizenId = createResponse.body.id;

      // Act
      const response = await deleteRequest(app, `/api/v1/kaizens/${kaizenId}`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(200);
    });
  });

  describe("Integration Tests", () => {
    it("should handle kaizen lifecycle with status changes", async () => {
      // Arrange & Act - Create
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/kaizens`,
        {
          token: authToken,
          body: {
            title: "Lifecycle Kaizen",
            description: "Kaizen completo",
            authorId: userId,
            gameId,
            status: "OPEN",
          },
        },
      );

      expect(createResponse.statusCode).toBe(201);
      const kaizenId = createResponse.body.id;

      // Act - Update to in progress
      const updateResponse1 = await putRequest(
        app,
        `/api/v1/kaizens/${kaizenId}`,
        {
          token: authToken,
          body: { status: "IN_PROGRESS" },
        },
      );

      expect(updateResponse1.statusCode).toBe(200);
      expect(updateResponse1.body.status).toBe("IN_PROGRESS");

      // Act - Update to completed
      const updateResponse2 = await putRequest(
        app,
        `/api/v1/kaizens/${kaizenId}`,
        {
          token: authToken,
          body: { status: "COMPLETED" },
        },
      );

      expect(updateResponse2.statusCode).toBe(200);
      expect(updateResponse2.body.status).toBe("COMPLETED");
    });
  });
});
