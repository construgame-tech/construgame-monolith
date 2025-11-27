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

describe("TaskUpdateController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let organizationId: string;
  let gameId: string;
  let taskId: string;
  let userId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    // Create real test data in database
    userId = faker.uuid();
    const token = createToken(userId);

    // Create organization
    const orgResponse = await postRequest(app, "/api/v1/organization", {
      body: testData.organization({ ownerId: userId }),
      token,
    });
    organizationId = orgResponse.body.id;

    authToken = createToken(userId, organizationId, ["owner"]);

    // Create project
    const projectResponse = await postRequest(
      app,
      `/api/v1/organization/${organizationId}/project`,
      {
        body: testData.project(organizationId),
        token: authToken,
      },
    );
    const projectId = projectResponse.body.id;

    // Create game
    const gameResponse = await postRequest(app, "/api/v1/games", {
      body: {
        organizationId,
        projectId,
        name: "Task Update Test Game",
        prizes: [],
        kpis: [],
      },
      token: authToken,
    });
    gameId = gameResponse.body.id;

    // Create task
    const taskResponse = await postRequest(
      app,
      `/api/v1/games/${gameId}/tasks`,
      {
        body: {
          name: "Task for Updates",
          gameId,
          rewardPoints: 100,
        },
        token: authToken,
      },
    );
    taskId = taskResponse.body.id;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ===========================================
  // Basic Task Update Operations
  // ===========================================
  describe("POST /api/v1/games/:gameId/task-updates", () => {
    it("should create a task update", async () => {
      // Arrange
      const taskUpdateData = {
        taskId,
        submittedBy: userId,
        progress: 50,
        photos: ["https://example.com/photo1.jpg"],
        participants: [userId],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-updates`,
        {
          token: authToken,
          body: taskUpdateData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.taskId).toBe(taskId);
      expect(response.body.progress).toBe(50);
    });
  });

  describe("GET /api/v1/task-updates/:updateId", () => {
    it("should get task update by ID", async () => {
      // Arrange - Create a task update first
      const createResponse = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-updates`,
        {
          token: authToken,
          body: {
            taskId,
            submittedBy: userId,
            progress: 30,
          },
        },
      );
      const updateId = createResponse.body.id;

      // Act
      const response = await getRequest(
        app,
        `/api/v1/task-updates/${updateId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(updateId);
    });

    it("should return 404 for non-existent update", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/task-updates/${faker.uuid()}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/tasks/:taskId/task-updates", () => {
    it("should list task updates by task", async () => {
      const testTaskId = faker.uuid();

      // Arrange - Create some task updates
      await postRequest(app, `/api/v1/games/${gameId}/task-updates`, {
        token: authToken,
        body: {
          taskId: testTaskId,
          submittedBy: userId,
          progress: 10,
        },
      });

      await postRequest(app, `/api/v1/games/${gameId}/task-updates`, {
        token: authToken,
        body: {
          taskId: testTaskId,
          submittedBy: userId,
          progress: 20,
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/tasks/${testTaskId}/task-updates`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/v1/games/:gameId/task-updates", () => {
    it("should list task updates by game", async () => {
      const testGameId = faker.uuid();

      // Arrange - Create a task update
      await postRequest(app, `/api/v1/games/${testGameId}/task-updates`, {
        token: authToken,
        body: {
          taskId,
          submittedBy: userId,
          progress: 40,
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/games/${testGameId}/task-updates`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should filter by status", async () => {
      const testGameId = faker.uuid();

      // Arrange
      await postRequest(app, `/api/v1/games/${testGameId}/task-updates`, {
        token: authToken,
        body: {
          taskId,
          submittedBy: userId,
          progress: 50,
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/games/${testGameId}/task-updates`,
        {
          token: authToken,
          query: { status: "pending" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
    });
  });

  describe("PUT /api/v1/task-updates/:updateId/approve", () => {
    it("should approve a task update", async () => {
      // Arrange - Create a task update
      const createResponse = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-updates`,
        {
          token: authToken,
          body: {
            taskId,
            submittedBy: userId,
            progress: 60,
          },
        },
      );
      const updateId = createResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/task-updates/${updateId}/approve`,
        {
          token: authToken,
          body: {
            reviewedBy: userId,
            reviewNote: "Approved!",
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("approved");
    });
  });

  describe("PUT /api/v1/task-updates/:updateId/reject", () => {
    it("should reject a task update", async () => {
      // Arrange - Create a task update
      const createResponse = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-updates`,
        {
          token: authToken,
          body: {
            taskId,
            submittedBy: userId,
            progress: 70,
          },
        },
      );
      const updateId = createResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/task-updates/${updateId}/reject`,
        {
          token: authToken,
          body: {
            reviewedBy: userId,
            reviewNote: "Needs improvement",
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("rejected");
    });
  });

  describe("DELETE /api/v1/task-updates/:updateId", () => {
    it("should delete a task update", async () => {
      // Arrange - Create a task update
      const createResponse = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-updates`,
        {
          token: authToken,
          body: {
            taskId,
            submittedBy: userId,
            progress: 80,
          },
        },
      );
      const updateId = createResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/task-updates/${updateId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(204);
    });
  });

  // ===========================================
  // Singular Route Tests (/game/:gameId/task/:taskId/update)
  // ===========================================
  describe("POST /api/v1/game/:gameId/task/:taskId/update", () => {
    it("should create task update using singular route", async () => {
      // Arrange
      const taskUpdateData = {
        submittedBy: userId,
        progress: 25,
        photos: ["https://example.com/photo.jpg"],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/game/${gameId}/task/${taskId}/update`,
        {
          token: authToken,
          body: taskUpdateData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.gameId).toBe(gameId);
      expect(response.body.taskId).toBe(taskId);
    });
  });

  describe("PUT /api/v1/game/:gameId/task/:taskId/update/:taskUpdateId/approve", () => {
    it("should approve task update using singular route", async () => {
      // Arrange - Create a task update first
      const createResponse = await postRequest(
        app,
        `/api/v1/game/${gameId}/task/${taskId}/update`,
        {
          token: authToken,
          body: {
            submittedBy: userId,
            progress: 35,
          },
        },
      );
      const taskUpdateId = createResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/game/${gameId}/task/${taskId}/update/${taskUpdateId}/approve`,
        {
          token: authToken,
          body: {
            reviewedBy: userId,
            reviewNote: "Good job!",
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("approved");
    });
  });

  describe("PUT /api/v1/game/:gameId/task/:taskId/update/:taskUpdateId/reject", () => {
    it("should reject task update using singular route", async () => {
      // Arrange - Create a task update first
      const createResponse = await postRequest(
        app,
        `/api/v1/game/${gameId}/task/${taskId}/update`,
        {
          token: authToken,
          body: {
            submittedBy: userId,
            progress: 45,
          },
        },
      );
      const taskUpdateId = createResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/game/${gameId}/task/${taskId}/update/${taskUpdateId}/reject`,
        {
          token: authToken,
          body: {
            reviewedBy: userId,
            reviewNote: "Please provide more details",
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("rejected");
    });
  });

  describe("PUT /api/v1/game/:gameId/task/:taskId/update/:taskUpdateId/cancel", () => {
    it("should cancel task update using singular route", async () => {
      // Arrange - Create a task update first
      const createResponse = await postRequest(
        app,
        `/api/v1/game/${gameId}/task/${taskId}/update`,
        {
          token: authToken,
          body: {
            submittedBy: userId,
            progress: 55,
          },
        },
      );
      const taskUpdateId = createResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/game/${gameId}/task/${taskId}/update/${taskUpdateId}/cancel`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("cancelled");
    });
  });

  // ===========================================
  // Organization Task Update Listing
  // ===========================================
  describe("GET /api/v1/organization/:organizationId/task/update", () => {
    it("should list task updates for organization", async () => {
      // Arrange - Create some task updates
      await postRequest(app, `/api/v1/games/${gameId}/task-updates`, {
        token: authToken,
        body: {
          taskId,
          submittedBy: userId,
          progress: 65,
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/task/update`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should filter by status", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/task/update`,
        {
          token: authToken,
          query: { status: "pending" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should filter by submittedBy", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/task/update`,
        {
          token: authToken,
          query: { submittedBy: userId },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should filter by taskId", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/task/update`,
        {
          token: authToken,
          query: { taskId },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
    });
  });
});
