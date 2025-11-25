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

describe("ProjectDiaryController (e2e)", () => {
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

  describe("POST /api/v1/projects/:projectId/diary", () => {
    it("should create a new project diary entry", async () => {
      // Arrange
      const diaryData = {
        date: "2024-01-15",
        weather: "SUNNY",
        temperature: 28.5,
        workersPresent: 15,
        workersAbsent: 2,
        notes: "Dia produtivo com boas condições climáticas",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          token: authToken,
          body: diaryData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        projectId,
        date: diaryData.date,
        weather: diaryData.weather,
        temperature: diaryData.temperature,
        workersPresent: diaryData.workersPresent,
        workersAbsent: diaryData.workersAbsent,
        notes: diaryData.notes,
      });
    });

    it("should create diary with equipment and manpower", async () => {
      // Arrange
      const diaryData = {
        date: "2024-01-16",
        weather: "CLOUDY",
        equipment: [
          { name: "Betoneira", quantity: 2 },
          { name: "Andaime", quantity: 10 },
          { name: "Serra Circular", quantity: 3 },
        ],
        manpower: [
          { name: "Pedreiro", quantity: 5 },
          { name: "Servente", quantity: 8 },
          { name: "Eletricista", quantity: 2 },
        ],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          token: authToken,
          body: diaryData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.equipment).toHaveLength(3);
      expect(response.body.manpower).toHaveLength(3);
      expect(response.body.equipment[0]).toMatchObject({
        name: "Betoneira",
        quantity: 2,
      });
    });

    it("should upsert diary entry for the same date", async () => {
      // Arrange - Create initial entry
      const date = "2024-01-17";
      await postRequest(app, `/api/v1/projects/${projectId}/diary`, {
        token: authToken,
        body: {
          date,
          weather: "SUNNY",
          notes: "Original notes",
        },
      });

      // Act - Update with same date
      const response = await postRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          token: authToken,
          body: {
            date,
            weather: "RAINY",
            notes: "Updated notes - chuva interrompeu trabalho",
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.weather).toBe("RAINY");
      expect(response.body.notes).toBe(
        "Updated notes - chuva interrompeu trabalho",
      );

      // Verify only one entry exists for this date
      const listResponse = await getRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          token: authToken,
          query: { date },
        },
      );

      const entriesForDate = listResponse.body.items.filter(
        (entry: any) => entry.date === date,
      );
      expect(entriesForDate).toHaveLength(1);
    });

    it("should return 400 when date is missing", async () => {
      // Arrange
      const invalidData = {
        weather: "SUNNY",
        // Missing date
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
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
      const diaryData = {
        date: "2024-01-18",
        weather: "SUNNY",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          body: diaryData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/projects/:projectId/diary", () => {
    it("should list all diary entries for a project", async () => {
      // Arrange - Create multiple entries
      await postRequest(app, `/api/v1/projects/${projectId}/diary`, {
        token: authToken,
        body: {
          date: "2024-01-20",
          weather: "SUNNY",
          notes: "Entry 1",
        },
      });

      await postRequest(app, `/api/v1/projects/${projectId}/diary`, {
        token: authToken,
        body: {
          date: "2024-01-21",
          weather: "CLOUDY",
          notes: "Entry 2",
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThanOrEqual(2);
    });

    it("should filter diary entries by date", async () => {
      // Arrange
      const targetDate = "2024-01-22";
      await postRequest(app, `/api/v1/projects/${projectId}/diary`, {
        token: authToken,
        body: {
          date: targetDate,
          weather: "RAINY",
          notes: "Specific date entry",
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          token: authToken,
          query: { date: targetDate },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      const allMatchDate = response.body.items.every(
        (entry: any) => entry.date === targetDate,
      );
      expect(allMatchDate).toBe(true);
    });

    it("should return empty array when no entries exist", async () => {
      // Arrange
      const emptyProjectId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/projects/${emptyProjectId}/diary`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual([]);
    });
  });

  describe("PUT /api/v1/projects/:projectId/diary/:date", () => {
    it("should update an existing diary entry", async () => {
      // Arrange - Create initial entry
      const date = "2024-01-25";
      await postRequest(app, `/api/v1/projects/${projectId}/diary`, {
        token: authToken,
        body: {
          date,
          weather: "SUNNY",
          temperature: 25.0,
          notes: "Original notes",
        },
      });

      // Act
      const response = await putRequest(
        app,
        `/api/v1/projects/${projectId}/diary/${date}`,
        {
          token: authToken,
          body: {
            weather: "CLOUDY",
            temperature: 22.0,
            notes: "Updated notes with new temperature",
            workersPresent: 20,
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.weather).toBe("CLOUDY");
      expect(response.body.temperature).toBe(22.0);
      expect(response.body.notes).toBe("Updated notes with new temperature");
      expect(response.body.workersPresent).toBe(20);
    });

    it("should return 404 when diary entry does not exist", async () => {
      // Arrange
      const nonExistentDate = "2024-12-31";

      // Act
      const response = await putRequest(
        app,
        `/api/v1/projects/${projectId}/diary/${nonExistentDate}`,
        {
          token: authToken,
          body: {
            weather: "SUNNY",
            notes: "Test",
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/projects/:projectId/diary/:date", () => {
    it("should delete a diary entry", async () => {
      // Arrange - Create entry
      const date = "2024-01-26";
      await postRequest(app, `/api/v1/projects/${projectId}/diary`, {
        token: authToken,
        body: {
          date,
          weather: "SUNNY",
          notes: "To be deleted",
        },
      });

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/projects/${projectId}/diary/${date}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);

      // Verify it was deleted
      const getResponse = await getRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          token: authToken,
          query: { date },
        },
      );

      expect(getResponse.body.items).toEqual([]);
    });

    it("should return 404 when trying to delete non-existent entry", async () => {
      // Arrange
      const nonExistentDate = "2025-12-31";

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/projects/${projectId}/diary/${nonExistentDate}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/projects/:projectId/diary/options", () => {
    it("should return unique equipment and manpower names", async () => {
      // Arrange - Create entries with different equipment/manpower
      await postRequest(app, `/api/v1/projects/${projectId}/diary`, {
        token: authToken,
        body: {
          date: "2024-01-27",
          weather: "SUNNY",
          equipment: [
            { name: "Betoneira", quantity: 2 },
            { name: "Andaime", quantity: 5 },
          ],
          manpower: [
            { name: "Pedreiro", quantity: 3 },
            { name: "Servente", quantity: 5 },
          ],
        },
      });

      await postRequest(app, `/api/v1/projects/${projectId}/diary`, {
        token: authToken,
        body: {
          date: "2024-01-28",
          weather: "CLOUDY",
          equipment: [
            { name: "Betoneira", quantity: 3 },
            { name: "Guindaste", quantity: 1 },
          ],
          manpower: [
            { name: "Pedreiro", quantity: 4 },
            { name: "Eletricista", quantity: 2 },
          ],
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/projects/${projectId}/diary/options`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.equipmentNames).toBeInstanceOf(Array);
      expect(response.body.manpowerNames).toBeInstanceOf(Array);
      expect(response.body.equipmentNames).toContain("Betoneira");
      expect(response.body.equipmentNames).toContain("Andaime");
      expect(response.body.equipmentNames).toContain("Guindaste");
      expect(response.body.manpowerNames).toContain("Pedreiro");
      expect(response.body.manpowerNames).toContain("Servente");
      expect(response.body.manpowerNames).toContain("Eletricista");
    });

    it("should return empty arrays when no options exist", async () => {
      // Arrange
      const emptyProjectId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/projects/${emptyProjectId}/diary/options`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.equipmentNames).toEqual([]);
      expect(response.body.manpowerNames).toEqual([]);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete diary entry lifecycle", async () => {
      // Arrange
      const date = "2024-02-01";

      // Act 1 - Create
      const createResponse = await postRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          token: authToken,
          body: {
            date,
            weather: "SUNNY",
            temperature: 30.0,
            workersPresent: 25,
            workersAbsent: 3,
            equipment: [{ name: "Betoneira", quantity: 2 }],
            manpower: [{ name: "Pedreiro", quantity: 8 }],
            notes: "Início da concretagem",
          },
        },
      );

      expect(createResponse.statusCode).toBe(201);

      // Act 2 - Update
      const updateResponse = await putRequest(
        app,
        `/api/v1/projects/${projectId}/diary/${date}`,
        {
          token: authToken,
          body: {
            weather: "CLOUDY",
            temperature: 28.0,
            notes: "Concretagem concluída com sucesso",
          },
        },
      );

      expect(updateResponse.statusCode).toBe(200);

      // Act 3 - Get
      const getResponse = await getRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          token: authToken,
          query: { date },
        },
      );

      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.items[0].notes).toBe(
        "Concretagem concluída com sucesso",
      );

      // Act 4 - Delete
      const deleteResponse = await deleteRequest(
        app,
        `/api/v1/projects/${projectId}/diary/${date}`,
        {
          token: authToken,
        },
      );

      expect(deleteResponse.statusCode).toBe(200);
    });

    it("should handle weather variations", async () => {
      // Arrange & Act - Test all weather types
      const weatherTypes = ["SUNNY", "CLOUDY", "RAINY"];

      for (let i = 0; i < weatherTypes.length; i++) {
        const response = await postRequest(
          app,
          `/api/v1/projects/${projectId}/diary`,
          {
            token: authToken,
            body: {
              date: `2024-02-0${i + 5}`,
              weather: weatherTypes[i],
              notes: `Weather test: ${weatherTypes[i]}`,
            },
          },
        );

        // Assert
        expect(response.statusCode).toBe(201);
        expect(response.body.weather).toBe(weatherTypes[i]);
      }
    });

    it("should handle multiple equipment and manpower entries", async () => {
      // Arrange
      const diaryData = {
        date: "2024-02-10",
        weather: "SUNNY",
        equipment: [
          { name: "Betoneira", quantity: 3 },
          { name: "Andaime", quantity: 15 },
          { name: "Serra Circular", quantity: 5 },
          { name: "Furadeira", quantity: 10 },
          { name: "Martelo Demolidor", quantity: 2 },
        ],
        manpower: [
          { name: "Pedreiro", quantity: 10 },
          { name: "Servente", quantity: 15 },
          { name: "Eletricista", quantity: 3 },
          { name: "Encanador", quantity: 2 },
          { name: "Carpinteiro", quantity: 4 },
        ],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/projects/${projectId}/diary`,
        {
          token: authToken,
          body: diaryData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.equipment).toHaveLength(5);
      expect(response.body.manpower).toHaveLength(5);
    });
  });
});
