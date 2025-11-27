import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createToken,
  deleteRequest,
  faker,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
  testData,
} from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("GameController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let organizationId: string;
  let projectId: string;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    app = await setupTestApp();

    userId = faker.uuid();
    token = createToken(userId);

    // Create real test data in database
    const orgResponse = await postRequest(app, "/api/v1/organizations", {
      body: testData.organization({ ownerId: userId }),
      token,
    });
    organizationId = orgResponse.body.id;

    const projectResponse = await postRequest(
      app,
      `/api/v1/organizations/${organizationId}/projects`,
      {
        body: testData.project(organizationId),
        token,
      },
    );
    projectId = projectResponse.body.id;

    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("POST /api/v1/games", () => {
    it("should create a new game", async () => {
      // Arrange
      const gameData = {
        organizationId,
        projectId,
        name: "Test Game",
        gameManagerId: faker.uuid(),
        photo: "https://example.com/photo.jpg",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        managerId: userId,
        responsibles: [userId],
        objective: "Test objective",
        prizes: [],
        kpis: [],
        updateFrequency: 7,
      };

      // Act
      const response = await postRequest(app, "/api/v1/games", {
        token: authToken,
        body: gameData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: gameData.name,
        organizationId,
      });
    });

    it("should return 400 when required fields are missing", async () => {
      // Arrange
      const invalidGameData = {
        name: "Test Game",
        // Missing required fields
      };

      // Act
      const response = await postRequest(app, "/api/v1/games", {
        token: authToken,
        body: invalidGameData,
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 401 when no auth token is provided", async () => {
      // Arrange
      const gameData = {
        name: "Test Game",
      };

      // Act
      const response = await postRequest(app, "/api/v1/games", {
        body: gameData,
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/games/:id", () => {
    it("should retrieve a game by id", async () => {
      // Arrange - Create a game first
      const gameData = {
        organizationId,
        projectId,
        name: "Test Game for GET",
        gameManagerId: faker.uuid(),
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        managerId: userId,
        responsibles: [userId],
      };

      const createResponse = await postRequest(app, "/api/v1/games", {
        token: authToken,
        body: gameData,
      });

      const gameId = createResponse.body.id;

      // Act
      const response = await getRequest(app, `/api/v1/games/${gameId}`, {
        token: authToken,
        query: { organizationId },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: gameId,
        name: gameData.name,
      });
    });

    it("should return 404 when game does not exist", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await getRequest(app, `/api/v1/games/${nonExistentId}`, {
        token: authToken,
        query: { organizationId },
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("PUT /api/v1/games/:id", () => {
    it("should update a game", async () => {
      // Arrange - Create a game first
      const gameData = {
        organizationId,
        projectId,
        name: "Test Game for UPDATE",
        gameManagerId: faker.uuid(),
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        managerId: userId,
        responsibles: [userId],
      };

      const createResponse = await postRequest(app, "/api/v1/games", {
        token: authToken,
        body: gameData,
      });

      const gameId = createResponse.body.id;
      const updateData = {
        name: "Updated Game Name",
      };

      // Act
      const response = await putRequest(app, `/api/v1/games/${gameId}`, {
        token: authToken,
        body: updateData,
        query: { organizationId },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe(updateData.name);
    });
  });

  describe("DELETE /api/v1/games/:id", () => {
    it("should delete a game", async () => {
      // Arrange - Create a game first
      const gameData = {
        organizationId,
        projectId,
        name: "Test Game for DELETE",
        gameManagerId: faker.uuid(),
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        managerId: userId,
        responsibles: [userId],
      };

      const createResponse = await postRequest(app, "/api/v1/games", {
        token: authToken,
        body: gameData,
      });

      const gameId = createResponse.body.id;

      // Act
      const response = await deleteRequest(app, `/api/v1/games/${gameId}`, {
        token: authToken,
        query: { organizationId },
      });

      // Assert
      expect(response.statusCode).toBe(204);

      // Verify game is deleted
      const getResponse = await getRequest(app, `/api/v1/games/${gameId}`, {
        token: authToken,
        query: { organizationId },
      });
      expect(getResponse.statusCode).toBe(404);
    });
  });

  describe("POST /api/v1/games/:id/archive", () => {
    it("should archive a game", async () => {
      // Arrange - Create a game first
      const gameData = {
        organizationId,
        projectId,
        name: "Test Game for ARCHIVE",
        gameManagerId: faker.uuid(),
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        managerId: userId,
        responsibles: [userId],
      };

      const createResponse = await postRequest(app, "/api/v1/games", {
        token: authToken,
        body: gameData,
      });

      const gameId = createResponse.body.id;

      // Act
      const response = await postRequest(
        app,
        `/api/v1/games/${gameId}/archive`,
        {
          token: authToken,
          query: { organizationId },
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);

      // Verify game is archived
      const getResponse = await getRequest(app, `/api/v1/games/${gameId}`, {
        token: authToken,
        query: { organizationId },
      });
      expect(getResponse.body.archived).toBe(true);
    });
  });

  describe("GET /api/v1/games", () => {
    it("should list games for an organization", async () => {
      // Arrange - Create multiple games
      const gameData1 = {
        organizationId,
        projectId,
        name: "Test Game 1",
        gameManagerId: faker.uuid(),
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        managerId: userId,
        responsibles: [userId],
      };

      const gameData2 = {
        organizationId,
        projectId,
        name: "Test Game 2",
        gameManagerId: faker.uuid(),
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        managerId: userId,
        responsibles: [userId],
      };

      await postRequest(app, "/api/v1/games", {
        token: authToken,
        body: gameData1,
      });

      await postRequest(app, "/api/v1/games", {
        token: authToken,
        body: gameData2,
      });

      // Act
      const response = await getRequest(app, "/api/v1/games", {
        token: authToken,
        query: { organizationId },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("games");
      expect(Array.isArray(response.body.games)).toBe(true);
      expect(response.body.games.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ===========================================
  // OrganizationGameController E2E Tests
  // ===========================================
  describe("GET /api/v1/organization/:organizationId/game", () => {
    it("should list games for organization using org prefix route", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/game`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("games");
    });
  });

  describe("POST /api/v1/organization/:organizationId/game", () => {
    it("should create game using org prefix route", async () => {
      // Arrange
      const gameData = {
        projectId,
        name: "Org Prefix Game",
        gameManagerId: faker.uuid(),
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        managerId: userId,
        responsibles: [userId],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game`,
        {
          token: authToken,
          body: gameData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe("Org Prefix Game");
      expect(response.body.organizationId).toBe(organizationId);
    });
  });

  describe("PATCH /api/v1/organization/:organizationId/game/:gameId", () => {
    it("should update game using org prefix PATCH route", async () => {
      // Arrange - Create a game first
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game for PATCH",
            gameManagerId: faker.uuid(),
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            managerId: userId,
            responsibles: [userId],
          },
        },
      );
      const gameId = createResponse.body.id;

      // Act
      const response = await patchRequest(
        app,
        `/api/v1/organization/${organizationId}/game/${gameId}`,
        {
          token: authToken,
          body: { name: "Updated via PATCH" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe("Updated via PATCH");
    });
  });

  describe("DELETE /api/v1/organization/:organizationId/game/:gameId", () => {
    it("should delete game using org prefix route", async () => {
      // Arrange - Create a game first
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game for DELETE",
            gameManagerId: faker.uuid(),
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            managerId: userId,
            responsibles: [userId],
          },
        },
      );
      const gameId = createResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/game/${gameId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
    });
  });

  describe("PUT /api/v1/organization/:organizationId/game/:gameId/archive", () => {
    it("should archive game using org prefix route", async () => {
      // Arrange - Create a game first
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game for Archive",
            gameManagerId: faker.uuid(),
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            managerId: userId,
            responsibles: [userId],
          },
        },
      );
      const gameId = createResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/game/${gameId}/archive`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.archived).toBe(true);
    });
  });

  describe("PUT /api/v1/organization/:organizationId/game/:gameId/unarchive", () => {
    it("should unarchive game using org prefix route", async () => {
      // Arrange - Create and archive a game first
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game for Unarchive",
            gameManagerId: faker.uuid(),
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            managerId: userId,
            responsibles: [userId],
          },
        },
      );
      const gameId = createResponse.body.id;

      // Archive first
      await putRequest(
        app,
        `/api/v1/organization/${organizationId}/game/${gameId}/archive`,
        {
          token: authToken,
        },
      );

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/game/${gameId}/unarchive`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.archived).toBe(false);
    });
  });

  // ===========================================
  // GameRankingController E2E Tests
  // ===========================================
  describe("GET /api/v1/organization/:organizationId/game/:gameId/ranking", () => {
    it("should get game ranking with org prefix route", async () => {
      // Arrange - Create a game first
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game for Ranking",
            gameManagerId: faker.uuid(),
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            managerId: userId,
            responsibles: [userId],
          },
        },
      );
      const gameId = createResponse.body.id;

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/game/${gameId}/ranking`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("ranking");
      expect(Array.isArray(response.body.ranking)).toBe(true);
    });

    it("should get game ranking grouped by team", async () => {
      // Arrange - Create a game first
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game for Team Ranking",
            gameManagerId: faker.uuid(),
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            managerId: userId,
            responsibles: [userId],
          },
        },
      );
      const gameId = createResponse.body.id;

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/game/${gameId}/ranking`,
        {
          token: authToken,
          query: { groupBy: "team" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("ranking");
    });
  });

  describe("GET /api/v1/game/:gameId/ranking", () => {
    it("should get game ranking with simple /game route", async () => {
      // Arrange - Create a game first
      const createResponse = await postRequest(app, "/api/v1/games", {
        token: authToken,
        body: {
          organizationId,
          projectId,
          name: "Game for Simple Ranking",
          gameManagerId: faker.uuid(),
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          managerId: userId,
          responsibles: [userId],
        },
      });
      const gameId = createResponse.body.id;

      // Act
      const response = await getRequest(app, `/api/v1/game/${gameId}/ranking`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("ranking");
    });

    it("should support sectorId filter", async () => {
      // Arrange - Create a game first
      const createResponse = await postRequest(app, "/api/v1/games", {
        token: authToken,
        body: {
          organizationId,
          projectId,
          name: "Game for Sector Ranking",
          gameManagerId: faker.uuid(),
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          managerId: userId,
          responsibles: [userId],
        },
      });
      const gameId = createResponse.body.id;

      // Act
      const response = await getRequest(app, `/api/v1/game/${gameId}/ranking`, {
        token: authToken,
        query: { groupBy: "user", sectorId: faker.uuid() },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("ranking");
    });
  });
});
