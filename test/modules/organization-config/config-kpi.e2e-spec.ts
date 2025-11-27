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

describe("ConfigKpiController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let userId: string;
  let organizationId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    userId = faker.uuid();
    organizationId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("GET /api/v1/organization/:organizationId/config/kpi", () => {
    it("should return list of organization KPIs", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/config/kpi`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/config/kpi`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /api/v1/organization/:organizationId/config/kpi", () => {
    it("should create a new KPI", async () => {
      // Arrange
      const kpiData = {
        name: "Taxa de Conclusão",
        type: "percentage",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/config/kpi`,
        {
          token: authToken,
          body: kpiData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: kpiData.name,
        type: kpiData.type,
      });
    });

    it("should return 400 when required fields are missing", async () => {
      // Arrange
      const invalidData = {};

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/config/kpi`,
        {
          token: authToken,
          body: invalidData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe("PUT /api/v1/organization/:organizationId/config/kpi/:kpiId", () => {
    it("should update an existing KPI", async () => {
      // Arrange - criar KPI primeiro
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/config/kpi`,
        {
          token: authToken,
          body: {
            name: "KPI Original",
            type: "number",
          },
        },
      );

      const kpiId = createResponse.body.id;
      const updateData = {
        name: "KPI Atualizado",
        type: "percentage",
      };

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/config/kpi/${kpiId}`,
        {
          token: authToken,
          body: updateData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: kpiId,
        name: updateData.name,
        type: updateData.type,
      });
    });

    it("should return 404 when updating non-existent KPI", async () => {
      // Arrange
      const nonExistentId = faker.uuid();
      const updateData = {
        name: "Updated Name",
        type: "number",
      };

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/config/kpi/${nonExistentId}`,
        {
          token: authToken,
          body: updateData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/organization/:organizationId/config/kpi/:kpiId", () => {
    it("should delete an existing KPI", async () => {
      // Arrange - criar KPI primeiro
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/config/kpi`,
        {
          token: authToken,
          body: {
            name: "KPI para Deletar",
            type: "number",
          },
        },
      );

      const kpiId = createResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/config/kpi/${kpiId}`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(204);
    });

    it("should return 404 when deleting non-existent KPI", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/config/kpi/${nonExistentId}`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });
});
