import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createToken, faker, getRequest } from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("ProjectRankingController (e2e)", () => {
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

  describe("GET /api/v1/projects/:projectId/ranking", () => {
    it("should return project ranking", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/projects/${projectId}/ranking`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("ranking");
      expect(Array.isArray(response.body.ranking)).toBe(true);
    });

    it("should accept groupBy query parameter", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/projects/${projectId}/ranking`,
        {
          token: authToken,
          query: { groupBy: "team" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("ranking");
    });

    it("should accept sectorId query parameter", async () => {
      // Arrange
      const sectorId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/projects/${projectId}/ranking`,
        {
          token: authToken,
          query: { sectorId },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
    });
  });
});

describe("ProjectReportController (e2e)", () => {
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

  describe("GET /api/v1/organization/:organizationId/project/:projectId/report", () => {
    it("should return project report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/report`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("reportUrl");
    });
  });
});
