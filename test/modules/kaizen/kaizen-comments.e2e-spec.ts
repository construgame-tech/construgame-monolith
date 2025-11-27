import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createToken,
  deleteRequest,
  faker,
  getRequest,
  postRequest,
} from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("KaizenController - Comments (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let projectId: string;
  let gameId: string;
  let kaizenId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    userId = faker.uuid();
    organizationId = faker.uuid();
    projectId = faker.uuid();
    gameId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);

    // Criar um kaizen para usar nos testes de comentários
    const createResponse = await postRequest(
      app,
      `/api/v1/organization/${organizationId}/project/${projectId}/kaizen`,
      {
        token: authToken,
        body: {
          name: "Kaizen para Comentários",
          description: "Kaizen usado para testar comentários",
          authorId: userId,
          gameId,
        },
      },
    );

    if (createResponse.statusCode === 201) {
      kaizenId = createResponse.body.id;
    } else {
      kaizenId = faker.uuid();
    }
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("POST /api/v1/game/:gameId/kaizen/:kaizenId/comment", () => {
    it("should create a new comment", async () => {
      // Arrange
      const commentData = {
        text: "Este é um comentário de teste",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/game/${gameId}/kaizen/${kaizenId}/comment`,
        {
          token: authToken,
          body: commentData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        kaizenId: kaizenId,
        text: commentData.text,
      });
    });

    it("should return 400 when text is missing", async () => {
      // Arrange
      const invalidData = {};

      // Act
      const response = await postRequest(
        app,
        `/api/v1/game/${gameId}/kaizen/${kaizenId}/comment`,
        {
          token: authToken,
          body: invalidData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/game/:gameId/kaizen/:kaizenId/comment", () => {
    it("should list all comments for a kaizen", async () => {
      // Arrange - criar um comentário primeiro
      await postRequest(
        app,
        `/api/v1/game/${gameId}/kaizen/${kaizenId}/comment`,
        {
          token: authToken,
          body: { text: "Comentário para listagem" },
        },
      );

      // Act
      const response = await getRequest(
        app,
        `/api/v1/game/${gameId}/kaizen/${kaizenId}/comment`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it("should return empty array for kaizen with no comments", async () => {
      // Arrange
      const newKaizenId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/game/${gameId}/kaizen/${newKaizenId}/comment`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(response.body.items).toHaveLength(0);
    });
  });

  describe("DELETE /api/v1/game/:gameId/kaizen/:kaizenId/comment/:commentId", () => {
    it("should delete a comment", async () => {
      // Arrange - criar um comentário primeiro
      const createResponse = await postRequest(
        app,
        `/api/v1/game/${gameId}/kaizen/${kaizenId}/comment`,
        {
          token: authToken,
          body: { text: "Comentário para deletar" },
        },
      );

      const commentId = createResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/game/${gameId}/kaizen/${kaizenId}/comment/${commentId}`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(204);
    });

    it("should return 404 when deleting non-existent comment", async () => {
      // Arrange
      const nonExistentCommentId = faker.uuid();

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/game/${gameId}/kaizen/${kaizenId}/comment/${nonExistentCommentId}`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });
});
