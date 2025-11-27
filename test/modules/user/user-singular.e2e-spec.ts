import type { NestFastifyApplication } from "@nestjs/platform-fastify";
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

describe("UserSingularController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let projectId: string;
  let gameId: string;
  let createdUserId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    userId = faker.uuid();
    authToken = createToken(userId);

    // Create organization and project for testing
    const orgResponse = await postRequest(app, "/api/v1/organizations", {
      body: testData.organization({ ownerId: userId }),
      token: authToken,
    });
    organizationId = orgResponse.body.id;

    const projectResponse = await postRequest(
      app,
      `/api/v1/organizations/${organizationId}/projects`,
      {
        body: testData.project(organizationId),
        token: authToken,
      },
    );
    projectId = projectResponse.body.id;

    // Create a game for testing
    const gameData = {
      organizationId,
      projectId,
      name: "Test Game for User",
      gameManagerId: faker.uuid(),
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      managerId: userId,
      responsibles: [userId],
      objective: "Test objective",
      prizes: [],
      kpis: [],
      updateFrequency: 7,
    };

    const gameResponse = await postRequest(app, "/api/v1/games", {
      token: authToken,
      body: gameData,
    });
    gameId = gameResponse.body.id;

    // Create a test user
    const userResponse = await postRequest(app, "/api/v1/users", {
      token: authToken,
      body: {
        email: `singulartest${Date.now()}@test.com`,
        name: "Singular Test User",
        password: "test123",
      },
    });
    createdUserId = userResponse.body.id;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("GET /api/v1/user/:userId", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/user/${createdUserId}`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return user when found", async () => {
      // Act
      const response = await getRequest(app, `/api/v1/user/${createdUserId}`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body.id).toBe(createdUserId);
    });

    it("should return 404 when user not found", async () => {
      // Act
      const response = await getRequest(app, `/api/v1/user/${faker.uuid()}`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("PUT /api/v1/user/:userId", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await putRequest(app, `/api/v1/user/${createdUserId}`, {
        body: { name: "Updated Name" },
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should update user when valid data provided", async () => {
      // Arrange
      const updateData = {
        name: "Updated User Name",
        nickname: "UpdatedNick",
      };

      // Act
      const response = await putRequest(app, `/api/v1/user/${createdUserId}`, {
        token: authToken,
        body: updateData,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe(updateData.name);
    });
  });

  describe("DELETE /api/v1/user/:userId", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/user/${faker.uuid()}`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("PUT /api/v1/user/:userId/push-token/:pushToken", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await putRequest(
        app,
        `/api/v1/user/${createdUserId}/push-token/ExponentPushToken123`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should register push token successfully (stub)", async () => {
      // Act
      const response = await putRequest(
        app,
        `/api/v1/user/${createdUserId}/push-token/ExponentPushToken123`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("registered successfully");
    });
  });

  describe("DELETE /api/v1/user/:userId/push-token/:pushToken", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/user/${createdUserId}/push-token/ExponentPushToken123`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should remove push token successfully (stub)", async () => {
      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/user/${createdUserId}/push-token/ExponentPushToken123`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("removed successfully");
    });
  });

  describe("GET /api/v1/user/:userId/game/:gameId/task", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/user/${createdUserId}/game/${gameId}/task`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return tasks list (may be empty)", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/user/${createdUserId}/game/${gameId}/task`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it("should support date filters", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/user/${createdUserId}/game/${gameId}/task`,
        {
          token: authToken,
          query: {
            startDateBefore: "2025-12-31",
            endDateAfter: "2020-01-01",
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/user/:userId/organization/:organizationId/game", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/user/${createdUserId}/organization/${organizationId}/game`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return games list (may be empty)", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/user/${createdUserId}/organization/${organizationId}/game`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });

  describe("GET /api/v1/user/:userId/organization/:organizationId/task/update", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/user/${createdUserId}/organization/${organizationId}/task/update`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return task updates list with pagination", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/user/${createdUserId}/organization/${organizationId}/task/update`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(response.body).toHaveProperty("page");
      expect(response.body).toHaveProperty("limit");
      expect(response.body).toHaveProperty("total");
    });

    it("should support status filter", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/user/${createdUserId}/organization/${organizationId}/task/update`,
        {
          token: authToken,
          query: { status: "PENDING_REVIEW" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should support pagination parameters", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/user/${createdUserId}/organization/${organizationId}/task/update`,
        {
          token: authToken,
          query: { page: 1, limit: 10 },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });
  });
});
