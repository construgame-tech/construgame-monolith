import type { INestApplication } from "@nestjs/common";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createToken,
  deleteRequest,
  faker,
  getRequest,
  postRequest,
  putRequest,
  testData,
} from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("GameController (e2e)", () => {
  let app: INestApplication;
  let authToken: string;
  let organizationId: string;
  let projectId: string;
  let userId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    userId = faker.uuid();

    // Create real test data in database
    const orgResponse = await postRequest(app, "/api/v1/organizations", {
      body: testData.organization({ ownerId: userId }),
    });
    organizationId = orgResponse.body.id;

    const projectResponse = await postRequest(
      app,
      `/api/v1/organizations/${organizationId}/projects`,
      {
        body: testData.project(organizationId),
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
        projectId,
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
        organizationId,
        projectId,
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
      expect(response.statusCode).toBe(200);

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
      expect(response.statusCode).toBe(200);

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
      expect(Array.isArray(response.body.items || response.body)).toBe(true);
      expect(
        (response.body.items || response.body).length,
      ).toBeGreaterThanOrEqual(2);
    });
  });
});
