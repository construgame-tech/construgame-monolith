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

describe("TaskController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let gameId: string;
  let projectId: string;

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

  describe("POST /api/v1/tasks", () => {
    it("should create a new task", async () => {
      // Arrange
      const taskData = {
        name: "Concretagem Laje",
        gameId,
        projectId,
        organizationId,
        description: "Realizar concretagem da laje do 3º andar",
        startDate: "2024-01-15",
        endDate: "2024-01-16",
        status: "PENDING",
        priority: "HIGH",
      };

      // Act
      const response = await postRequest(app, "/api/v1/tasks", {
        token: authToken,
        body: taskData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: taskData.name,
        gameId,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
      });
    });

    it("should create task with minimal data", async () => {
      // Arrange
      const taskData = {
        name: "Tarefa Mínima",
        gameId,
        projectId,
        organizationId,
      };

      // Act
      const response = await postRequest(app, "/api/v1/tasks", {
        token: authToken,
        body: taskData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe(taskData.name);
      expect(response.body.gameId).toBe(gameId);
    });

    it("should return 400 when required fields are missing", async () => {
      // Arrange
      const invalidData = {
        description: "Tarefa sem nome",
      };

      // Act
      const response = await postRequest(app, "/api/v1/tasks", {
        token: authToken,
        body: invalidData,
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 401 when no auth token is provided", async () => {
      // Arrange
      const taskData = {
        name: "Test Task",
        gameId,
        projectId,
        organizationId,
      };

      // Act
      const response = await postRequest(app, "/api/v1/tasks", {
        body: taskData,
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/tasks/:taskId", () => {
    it("should get a task by id", async () => {
      // Arrange - Create task first
      const createResponse = await postRequest(app, "/api/v1/tasks", {
        token: authToken,
        body: {
          name: "Tarefa para Consulta",
          gameId,
          projectId,
          organizationId,
        },
      });

      const taskId = createResponse.body.id;

      // Act
      const response = await getRequest(app, `/api/v1/tasks/${taskId}`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: taskId,
        name: "Tarefa para Consulta",
      });
    });

    it("should return 404 when task does not exist", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await getRequest(app, `/api/v1/tasks/${nonExistentId}`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/tasks", () => {
    it("should list all tasks for a game", async () => {
      // Arrange - Create at least 2 tasks
      await postRequest(app, "/api/v1/tasks", {
        token: authToken,
        body: {
          name: "Tarefa List 1",
          gameId,
          projectId,
          organizationId,
        },
      });

      await postRequest(app, "/api/v1/tasks", {
        token: authToken,
        body: {
          name: "Tarefa List 2",
          gameId,
          projectId,
          organizationId,
        },
      });

      // Act
      const response = await getRequest(app, "/api/v1/tasks", {
        token: authToken,
        query: { gameId },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("PUT /api/v1/tasks/:taskId", () => {
    it("should update a task", async () => {
      // Arrange - Create task
      const createResponse = await postRequest(app, "/api/v1/tasks", {
        token: authToken,
        body: {
          name: "Tarefa Original",
          gameId,
          projectId,
          organizationId,
          status: "PENDING",
        },
      });

      const taskId = createResponse.body.id;

      // Act
      const response = await putRequest(app, `/api/v1/tasks/${taskId}`, {
        token: authToken,
        body: {
          name: "Tarefa Atualizada",
          status: "IN_PROGRESS",
          description: "Descrição atualizada",
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe("Tarefa Atualizada");
      expect(response.body.status).toBe("IN_PROGRESS");
      expect(response.body.description).toBe("Descrição atualizada");
    });

    it("should return 404 when updating non-existent task", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await putRequest(app, `/api/v1/tasks/${nonExistentId}`, {
        token: authToken,
        body: { name: "Test" },
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/tasks/:taskId", () => {
    it("should delete a task", async () => {
      // Arrange - Create task
      const createResponse = await postRequest(app, "/api/v1/tasks", {
        token: authToken,
        body: {
          name: "Tarefa para Deletar",
          gameId,
          projectId,
          organizationId,
        },
      });

      const taskId = createResponse.body.id;

      // Act
      const response = await deleteRequest(app, `/api/v1/tasks/${taskId}`, {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(200);

      // Verify it was deleted
      const getResponse = await getRequest(app, `/api/v1/tasks/${taskId}`, {
        token: authToken,
      });

      expect(getResponse.statusCode).toBe(404);
    });

    it("should return 404 when deleting non-existent task", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/tasks/${nonExistentId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete task lifecycle", async () => {
      // Arrange & Act - Create
      const createResponse = await postRequest(app, "/api/v1/tasks", {
        token: authToken,
        body: {
          name: "Lifecycle Task",
          gameId,
          projectId,
          organizationId,
          description: "Tarefa completa",
          status: "PENDING",
          priority: "MEDIUM",
          startDate: "2024-02-01",
          endDate: "2024-02-05",
        },
      });

      expect(createResponse.statusCode).toBe(201);
      const taskId = createResponse.body.id;

      // Act - Get
      const getResponse = await getRequest(app, `/api/v1/tasks/${taskId}`, {
        token: authToken,
      });

      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.name).toBe("Lifecycle Task");

      // Act - Update to in progress
      const updateResponse1 = await putRequest(app, `/api/v1/tasks/${taskId}`, {
        token: authToken,
        body: {
          status: "IN_PROGRESS",
        },
      });

      expect(updateResponse1.statusCode).toBe(200);
      expect(updateResponse1.body.status).toBe("IN_PROGRESS");

      // Act - Update to completed
      const updateResponse2 = await putRequest(app, `/api/v1/tasks/${taskId}`, {
        token: authToken,
        body: {
          status: "COMPLETED",
        },
      });

      expect(updateResponse2.statusCode).toBe(200);
      expect(updateResponse2.body.status).toBe("COMPLETED");

      // Act - Delete
      const deleteResponse = await deleteRequest(
        app,
        `/api/v1/tasks/${taskId}`,
        {
          token: authToken,
        },
      );

      expect(deleteResponse.statusCode).toBe(200);
    });

    it("should handle tasks with different priorities", async () => {
      // Arrange & Act
      const priorities = ["LOW", "MEDIUM", "HIGH"];

      for (const priority of priorities) {
        const response = await postRequest(app, "/api/v1/tasks", {
          token: authToken,
          body: {
            name: `Task ${priority}`,
            gameId,
            projectId,
            organizationId,
            priority,
          },
        });

        // Assert
        expect(response.statusCode).toBe(201);
        expect(response.body.priority).toBe(priority);
      }
    });
  });
});
