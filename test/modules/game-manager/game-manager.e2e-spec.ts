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

describe("GameManagerController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let organizationId: string;
  let projectId: string;
  let userId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    // Setup test data
    organizationId = faker.uuid();
    projectId = faker.uuid();
    userId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ===========================================
  // Game Manager CRUD Operations
  // ===========================================
  describe("GET /api/v1/organization/:organizationId/game-manager", () => {
    it("should list game managers for organization", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });

  describe("POST /api/v1/organization/:organizationId/game-manager", () => {
    it("should create a game manager", async () => {
      // Arrange
      const gameManagerData = {
        projectId,
        name: "Construction Game Manager",
        photo: "https://example.com/photo.jpg",
        objective: "Improve construction quality",
        updateFrequency: 7,
        managerId: userId,
        responsibles: [userId],
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        gameLength: 365,
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: gameManagerData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("Construction Game Manager");
      expect(response.body.organizationId).toBe(organizationId);
      expect(response.body.projectId).toBe(projectId);
    });

    it("should create game manager with minimal data", async () => {
      // Arrange
      const gameManagerData = {
        projectId,
        name: "Minimal Game Manager",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: gameManagerData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe("Minimal Game Manager");
    });
  });

  describe("PUT /api/v1/organization/:organizationId/game-manager/:gameManagerId", () => {
    it("should update a game manager", async () => {
      // Arrange - Create a game manager first
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game Manager for Update",
          },
        },
      );
      const gameManagerId = createResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${gameManagerId}`,
        {
          token: authToken,
          body: {
            name: "Updated Game Manager Name",
            objective: "New objective",
            updateFrequency: 14,
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe("Updated Game Manager Name");
      expect(response.body.objective).toBe("New objective");
      expect(response.body.updateFrequency).toBe(14);
    });

    it("should return 404 for non-existent game manager", async () => {
      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${faker.uuid()}`,
        {
          token: authToken,
          body: { name: "Update" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });

    it("should return 404 when organization does not match", async () => {
      // Arrange - Create game manager
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Org Mismatch GM",
          },
        },
      );
      const gameManagerId = createResponse.body.id;

      // Act - Try to update with different org
      const differentOrgId = faker.uuid();
      const differentToken = createToken(userId, differentOrgId, ["owner"]);
      const response = await putRequest(
        app,
        `/api/v1/organization/${differentOrgId}/game-manager/${gameManagerId}`,
        {
          token: differentToken,
          body: { name: "Should Fail" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/organization/:organizationId/game-manager/:gameManagerId", () => {
    it("should delete a game manager", async () => {
      // Arrange - Create a game manager first
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game Manager to Delete",
          },
        },
      );
      const gameManagerId = createResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${gameManagerId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Game manager deleted");
    });

    it("should return 404 for non-existent game manager", async () => {
      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${faker.uuid()}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  // ===========================================
  // Task Manager dentro de Game Manager
  // ===========================================
  describe("GET /api/v1/organization/:organizationId/game-manager/:gameManagerId/task-manager", () => {
    it("should list task managers for a game manager", async () => {
      // Arrange - Create a game manager first
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game Manager for Task List",
          },
        },
      );
      const gameManagerId = createResponse.body.id;

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${gameManagerId}/task-manager`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it("should return 404 when game manager not found", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${faker.uuid()}/task-manager`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /api/v1/organization/:organizationId/game-manager/:gameManagerId/task-manager", () => {
    it("should create a task manager within game manager", async () => {
      // Arrange - Create a game manager first
      const createGmResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game Manager for Task Creation",
          },
        },
      );
      const gameManagerId = createGmResponse.body.id;

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${gameManagerId}/task-manager`,
        {
          token: authToken,
          body: {
            name: "Daily Cleaning Task",
            projectId,
            kpiId: faker.uuid(),
            description: "Clean the work area daily",
            rewardPoints: 10,
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("Daily Cleaning Task");
      expect(response.body.gameManagerId).toBe(gameManagerId);
      expect(response.body.rewardPoints).toBe(10);
    });

    it("should return 404 when game manager not found", async () => {
      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${faker.uuid()}/task-manager`,
        {
          token: authToken,
          body: {
            name: "Test Task",
            projectId,
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("PUT /api/v1/organization/:organizationId/game-manager/:gameManagerId/task-manager/:taskManagerId", () => {
    it("should update a task manager within game manager", async () => {
      // Arrange - Create game manager and task manager
      const createGmResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game Manager for Task Update",
          },
        },
      );
      const gameManagerId = createGmResponse.body.id;

      const createTmResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${gameManagerId}/task-manager`,
        {
          token: authToken,
          body: {
            name: "Task to Update",
            projectId,
            rewardPoints: 5,
          },
        },
      );
      const taskManagerId = createTmResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${gameManagerId}/task-manager/${taskManagerId}`,
        {
          token: authToken,
          body: {
            name: "Updated Task Name",
            description: "Updated description",
            rewardPoints: 15,
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe("Updated Task Name");
      expect(response.body.description).toBe("Updated description");
      expect(response.body.rewardPoints).toBe(15);
    });

    it("should return 404 for non-existent task manager", async () => {
      // Arrange - Create game manager
      const createGmResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game Manager for Not Found Test",
          },
        },
      );
      const gameManagerId = createGmResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${gameManagerId}/task-manager/${faker.uuid()}`,
        {
          token: authToken,
          body: { name: "Update" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/organization/:organizationId/game-manager/:gameManagerId/task-manager/:taskManagerId", () => {
    it("should delete a task manager within game manager", async () => {
      // Arrange - Create game manager and task manager
      const createGmResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game Manager for Task Delete",
          },
        },
      );
      const gameManagerId = createGmResponse.body.id;

      const createTmResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${gameManagerId}/task-manager`,
        {
          token: authToken,
          body: {
            name: "Task to Delete",
            projectId,
          },
        },
      );
      const taskManagerId = createTmResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${gameManagerId}/task-manager/${taskManagerId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Task manager deleted");
    });

    it("should return 404 for non-existent task manager", async () => {
      // Arrange - Create game manager
      const createGmResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {
          token: authToken,
          body: {
            projectId,
            name: "Game Manager for Delete Not Found Test",
          },
        },
      );
      const gameManagerId = createGmResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager/${gameManagerId}/task-manager/${faker.uuid()}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  // ===========================================
  // Complete Lifecycle Tests
  // ===========================================
  describe("Game Manager CRUD Lifecycle", () => {
    it("should handle complete lifecycle with task managers", async () => {
      const testOrgId = faker.uuid();
      const testToken = createToken(userId, testOrgId, ["owner"]);

      // Create Game Manager
      const createGm = await postRequest(
        app,
        `/api/v1/organization/${testOrgId}/game-manager`,
        {
          token: testToken,
          body: {
            projectId,
            name: "Lifecycle Test Game Manager",
            objective: "Test complete lifecycle",
          },
        },
      );
      expect(createGm.statusCode).toBe(201);
      const gameManagerId = createGm.body.id;

      // Add Task Managers
      const createTm1 = await postRequest(
        app,
        `/api/v1/organization/${testOrgId}/game-manager/${gameManagerId}/task-manager`,
        {
          token: testToken,
          body: {
            name: "Task 1",
            projectId,
            rewardPoints: 10,
          },
        },
      );
      expect(createTm1.statusCode).toBe(201);

      const createTm2 = await postRequest(
        app,
        `/api/v1/organization/${testOrgId}/game-manager/${gameManagerId}/task-manager`,
        {
          token: testToken,
          body: {
            name: "Task 2",
            projectId,
            rewardPoints: 20,
          },
        },
      );
      expect(createTm2.statusCode).toBe(201);

      // List Game Managers
      const listGm = await getRequest(
        app,
        `/api/v1/organization/${testOrgId}/game-manager`,
        {
          token: testToken,
        },
      );
      expect(listGm.statusCode).toBe(200);
      expect(listGm.body.items.length).toBeGreaterThanOrEqual(1);

      // List Task Managers
      const listTm = await getRequest(
        app,
        `/api/v1/organization/${testOrgId}/game-manager/${gameManagerId}/task-manager`,
        {
          token: testToken,
        },
      );
      expect(listTm.statusCode).toBe(200);
      expect(listTm.body.items).toHaveLength(2);

      // Update Game Manager
      const updateGm = await putRequest(
        app,
        `/api/v1/organization/${testOrgId}/game-manager/${gameManagerId}`,
        {
          token: testToken,
          body: {
            name: "Updated Lifecycle Game Manager",
          },
        },
      );
      expect(updateGm.statusCode).toBe(200);
      expect(updateGm.body.name).toBe("Updated Lifecycle Game Manager");

      // Delete Task Manager
      const deleteTm = await deleteRequest(
        app,
        `/api/v1/organization/${testOrgId}/game-manager/${gameManagerId}/task-manager/${createTm1.body.id}`,
        {
          token: testToken,
        },
      );
      expect(deleteTm.statusCode).toBe(200);

      // Verify Task Manager is deleted
      const listTmAfterDelete = await getRequest(
        app,
        `/api/v1/organization/${testOrgId}/game-manager/${gameManagerId}/task-manager`,
        {
          token: testToken,
        },
      );
      expect(listTmAfterDelete.body.items).toHaveLength(1);

      // Delete Game Manager (should also delete remaining task managers)
      const deleteGm = await deleteRequest(
        app,
        `/api/v1/organization/${testOrgId}/game-manager/${gameManagerId}`,
        {
          token: testToken,
        },
      );
      expect(deleteGm.statusCode).toBe(200);

      // Verify Game Manager is deleted
      const listGmAfterDelete = await getRequest(
        app,
        `/api/v1/organization/${testOrgId}/game-manager`,
        {
          token: testToken,
        },
      );
      const gmIds = listGmAfterDelete.body.items.map((gm: any) => gm.id);
      expect(gmIds).not.toContain(gameManagerId);
    });
  });

  describe("Authentication", () => {
    it("should return 401 when no token provided", async () => {
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/game-manager`,
        {},
      );

      expect(response.statusCode).toBe(401);
    });
  });
});
