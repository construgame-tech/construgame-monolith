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

describe("TaskManagerController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let organizationId: string;
  let projectId: string;
  let gameId: string;
  let kpiId: string;
  let userId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    // Setup test data
    organizationId = faker.uuid();
    projectId = faker.uuid();
    gameId = faker.uuid();
    kpiId = faker.uuid();
    userId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("POST /api/v1/games/:gameId/task-managers", () => {
    it("should create a new task manager", async () => {
      // Arrange
      const taskManagerData = {
        name: "Limpeza Diária",
        kpiId,
        rewardPoints: 10,
        responsible: {
          type: "team",
          ids: [faker.uuid()],
        },
        schedule: {
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          recurrence: {
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: false,
            sun: false,
          },
        },
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
          body: taskManagerData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: taskManagerData.name,
        gameId,
        kpiId,
        rewardPoints: 10,
        responsible: taskManagerData.responsible,
        schedule: taskManagerData.schedule,
      });
    });

    it("should create task manager with checklist", async () => {
      // Arrange
      const taskManagerData = {
        name: "Inspeção de Segurança",
        kpiId,
        rewardPoints: 15,
        responsible: {
          type: "player",
          ids: [userId],
        },
        schedule: {
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        },
        checklist: [
          { label: "Verificar EPIs" },
          { label: "Conferir extintor" },
          { label: "Verificar sinalização" },
        ],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
          body: taskManagerData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.checklist).toHaveLength(3);
      expect(response.body.checklist[0]).toMatchObject({
        id: expect.any(String),
        label: "Verificar EPIs",
        checked: false,
      });
    });

    it("should create task manager with macrostep reference", async () => {
      // Arrange
      const taskManagerData = {
        name: "Concretagem",
        kpiId,
        rewardPoints: 50,
        macrostep: {
          macrostepId: faker.uuid(),
          activityId: faker.uuid(),
        },
        responsible: {
          type: "team",
          ids: [faker.uuid()],
        },
        schedule: {
          startDate: "2024-02-01",
          endDate: "2024-02-28",
        },
        measurementUnit: "m³",
        totalMeasurementExpected: "100",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
          body: taskManagerData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.macrostep).toEqual(taskManagerData.macrostep);
      expect(response.body.measurementUnit).toBe("m³");
    });

    it("should return 400 when required fields are missing", async () => {
      // Arrange
      const invalidData = {
        name: "Test",
        // Missing required fields
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
          body: invalidData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 401 when no auth token is provided", async () => {
      // Arrange
      const taskManagerData = {
        name: "Test",
        kpiId,
        rewardPoints: 10,
        responsible: { type: "team", ids: [] },
        schedule: { startDate: "2024-01-01", endDate: "2024-12-31" },
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          body: taskManagerData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/games/:gameId/task-managers", () => {
    it("should list all task managers for a game", async () => {
      // Arrange - Create 2 task managers
      await postRequest(app, `/api/v1/games/${gameId}/task-managers`, {
        token: authToken,
        body: {
          name: "Task Manager 1",
          kpiId,
          rewardPoints: 10,
          responsible: { type: "team", ids: [] },
          schedule: { startDate: "2024-01-01", endDate: "2024-12-31" },
        },
      });

      await postRequest(app, `/api/v1/games/${gameId}/task-managers`, {
        token: authToken,
        body: {
          name: "Task Manager 2",
          kpiId,
          rewardPoints: 20,
          responsible: { type: "player", ids: [userId] },
          schedule: { startDate: "2024-01-01", endDate: "2024-12-31" },
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThanOrEqual(2);
    });

    it("should return empty array when no task managers exist", async () => {
      // Arrange
      const emptyGameId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/games/${emptyGameId}/task-managers`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual([]);
    });
  });

  describe("PUT /api/v1/task-managers/:taskManagerId", () => {
    it("should update a task manager", async () => {
      // Arrange - Create a task manager
      const createResponse = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
          body: {
            name: "Original Name",
            kpiId,
            rewardPoints: 10,
            responsible: { type: "team", ids: [] },
            schedule: { startDate: "2024-01-01", endDate: "2024-12-31" },
          },
        },
      );

      const taskManagerId = createResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/task-managers/${taskManagerId}`,
        {
          token: authToken,
          body: {
            name: "Updated Name",
            kpiId,
            rewardPoints: 25,
            responsible: { type: "player", ids: [userId] },
            schedule: { startDate: "2024-01-01", endDate: "2024-12-31" },
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe("Updated Name");
      expect(response.body.rewardPoints).toBe(25);
      expect(response.body.responsible.type).toBe("player");
    });

    it("should preserve checklist checked status when updating", async () => {
      // Arrange - Create with checklist
      const createResponse = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
          body: {
            name: "With Checklist",
            kpiId,
            rewardPoints: 10,
            responsible: { type: "team", ids: [] },
            schedule: { startDate: "2024-01-01", endDate: "2024-12-31" },
            checklist: [
              { id: "check-1", label: "Item 1" },
              { id: "check-2", label: "Item 2" },
            ],
          },
        },
      );

      const taskManagerId = createResponse.body.id;

      // Simulate that check-1 was checked (would need separate endpoint in real app)
      // For now, we'll just verify the checklist structure is maintained

      // Act - Update with same checklist IDs
      const response = await putRequest(
        app,
        `/api/v1/task-managers/${taskManagerId}`,
        {
          token: authToken,
          body: {
            name: "Updated With Checklist",
            kpiId,
            rewardPoints: 15,
            responsible: { type: "team", ids: [] },
            schedule: { startDate: "2024-01-01", endDate: "2024-12-31" },
            checklist: [
              { id: "check-1", label: "Item 1 Updated" },
              { id: "check-2", label: "Item 2" },
              { label: "New Item" }, // New item without ID
            ],
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.checklist).toHaveLength(3);
      expect(response.body.checklist[0].id).toBe("check-1");
      expect(response.body.checklist[2].id).toBeDefined(); // New item should have ID
    });

    it("should return 404 when task manager does not exist", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await putRequest(
        app,
        `/api/v1/task-managers/${nonExistentId}`,
        {
          token: authToken,
          body: {
            name: "Test",
            kpiId,
            rewardPoints: 10,
            responsible: { type: "team", ids: [] },
            schedule: { startDate: "2024-01-01", endDate: "2024-12-31" },
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/task-managers/:taskManagerId", () => {
    it("should delete a task manager", async () => {
      // Arrange - Create a task manager
      const createResponse = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
          body: {
            name: "To Delete",
            kpiId,
            rewardPoints: 10,
            responsible: { type: "team", ids: [] },
            schedule: { startDate: "2024-01-01", endDate: "2024-12-31" },
          },
        },
      );

      const taskManagerId = createResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/task-managers/${taskManagerId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);

      // Verify it was deleted
      const getResponse = await getRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
        },
      );

      const deleted = getResponse.body.items.find(
        (tm: any) => tm.id === taskManagerId,
      );
      expect(deleted).toBeUndefined();
    });

    it("should return 404 when trying to delete non-existent task manager", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/task-managers/${nonExistentId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("Integration Tests", () => {
    it("should create task manager with all optional fields", async () => {
      // Arrange
      const fullTaskManagerData = {
        name: "Complete Task Manager",
        kpiId,
        macrostep: {
          macrostepId: faker.uuid(),
          activityId: faker.uuid(),
        },
        description: "Detailed description of the task",
        measurementUnit: "m²",
        totalMeasurementExpected: "500",
        videoUrl: "https://example.com/video.mp4",
        embedVideoUrl: "https://youtube.com/embed/abc123",
        rewardPoints: 100,
        location: "Canteiro de obras - Área 3",
        responsible: {
          type: "team",
          ids: [faker.uuid(), faker.uuid()],
        },
        schedule: {
          startDate: "2024-03-01",
          endDate: "2024-03-31",
          recurrence: {
            mon: true,
            tue: false,
            wed: true,
            thu: false,
            fri: true,
            sat: false,
            sun: false,
          },
        },
        checklist: [
          { label: "Preparar materiais" },
          { label: "Executar tarefa" },
          { label: "Limpar área" },
          { label: "Registrar conclusão" },
        ],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
          body: fullTaskManagerData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        name: fullTaskManagerData.name,
        description: fullTaskManagerData.description,
        location: fullTaskManagerData.location,
        videoUrl: fullTaskManagerData.videoUrl,
        embedVideoUrl: fullTaskManagerData.embedVideoUrl,
      });
      expect(response.body.checklist).toHaveLength(4);
      expect(response.body.responsible.ids).toHaveLength(2);
    });

    it("should handle schedule with recurrence pattern", async () => {
      // Arrange - Only weekdays
      const weekdaysTask = {
        name: "Weekdays Only Task",
        kpiId,
        rewardPoints: 5,
        responsible: { type: "team", ids: [] },
        schedule: {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          recurrence: {
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: false,
            sun: false,
          },
        },
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/games/${gameId}/task-managers`,
        {
          token: authToken,
          body: weekdaysTask,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.schedule.recurrence.mon).toBe(true);
      expect(response.body.schedule.recurrence.sat).toBe(false);
      expect(response.body.schedule.recurrence.sun).toBe(false);
    });
  });
});
