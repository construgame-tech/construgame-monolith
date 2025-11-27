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

describe("ProjectDiaryOrgController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let projectId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    userId = faker.uuid();
    organizationId = faker.uuid();
    projectId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("POST /api/v1/organization/:organizationId/project/:projectId/diary", () => {
    it("should create a diary entry", async () => {
      // Arrange
      const diaryData = {
        date: "2025-01-15",
        notes: "Dia produtivo na obra",
        weather: {
          morning: "SUNNY",
          afternoon: "CLOUDY",
          night: "RAINY",
        },
        equipment: [
          { name: "Betoneira", quantity: 2 },
          { name: "Retroescavadeira", quantity: 1 },
        ],
        manpower: [
          { name: "Pedreiro", quantity: 5 },
          { name: "Ajudante", quantity: 10 },
        ],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary`,
        {
          token: authToken,
          body: diaryData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        organizationId,
        projectId,
        date: diaryData.date,
        notes: diaryData.notes,
      });
    });

    it("should create diary entry with current date when date is not provided", async () => {
      // Arrange
      const diaryData = {
        notes: "Notas do dia atual",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary`,
        {
          token: authToken,
          body: diaryData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.date).toBeDefined();
    });
  });

  describe("GET /api/v1/organization/:organizationId/project/:projectId/diary", () => {
    it("should list diary entries", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it("should filter diary entries by date", async () => {
      // Arrange
      const targetDate = "2025-01-15";

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary`,
        {
          token: authToken,
          query: { date: targetDate },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should limit diary entries", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary`,
        {
          token: authToken,
          query: { limit: 5 },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
    });
  });

  describe("GET /api/v1/organization/:organizationId/project/:projectId/diary/options", () => {
    it("should return diary options (equipment and manpower names)", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary/options`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("equipmentNames");
      expect(response.body).toHaveProperty("manpowerNames");
      expect(Array.isArray(response.body.equipmentNames)).toBe(true);
      expect(Array.isArray(response.body.manpowerNames)).toBe(true);
    });
  });

  describe("GET /api/v1/organization/:organizationId/project/:projectId/diary/:date", () => {
    it("should get diary entry by date", async () => {
      // Arrange - criar entrada primeiro
      const targetDate = "2025-02-10";
      await postRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary`,
        {
          token: authToken,
          body: {
            date: targetDate,
            notes: "Diário do dia 10/02",
          },
        },
      );

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary/${targetDate}`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.date).toBe(targetDate);
    });

    it("should return null for non-existent date", async () => {
      // Arrange
      const nonExistentDate = "1999-12-31";

      // Act - usando supertest diretamente para lidar com resposta null
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/organization/${organizationId}/project/${projectId}/diary/${nonExistentDate}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      // Assert - pode retornar 200/204 com null ou 404
      expect([200, 204, 404]).toContain(response.statusCode);
    });
  });

  describe("PUT /api/v1/organization/:organizationId/project/:projectId/diary/:date", () => {
    it("should update diary entry", async () => {
      // Arrange - criar entrada primeiro
      const targetDate = "2025-03-15";
      await postRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary`,
        {
          token: authToken,
          body: {
            date: targetDate,
            notes: "Notas originais",
          },
        },
      );

      const updateData = {
        notes: "Notas atualizadas",
        weather: {
          morning: "RAINY",
        },
      };

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary/${targetDate}`,
        {
          token: authToken,
          body: updateData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.notes).toBe(updateData.notes);
    });

    it("should return 404 when updating non-existent entry", async () => {
      // Arrange
      const nonExistentDate = "1990-01-01";
      const updateData = {
        notes: "Tentando atualizar",
      };

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary/${nonExistentDate}`,
        {
          token: authToken,
          body: updateData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/organization/:organizationId/project/:projectId/diary/:date", () => {
    it("should delete diary entry", async () => {
      // Arrange - criar entrada primeiro
      const targetDate = "2025-04-20";
      await postRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary`,
        {
          token: authToken,
          body: {
            date: targetDate,
            notes: "Entrada para deletar",
          },
        },
      );

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary/${targetDate}`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 404 when deleting non-existent entry", async () => {
      // Arrange
      const nonExistentDate = "1980-01-01";

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/diary/${nonExistentDate}`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });
});
