import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createToken, faker, postRequest } from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("ProjectPlanningController - Import (e2e)", () => {
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

  describe("POST /api/v1/organizations/:organizationId/projects/:projectId/macrosteps/import", () => {
    it("should import macrosteps with activities", async () => {
      // Arrange
      const importData = {
        macrosteps: [
          {
            name: "Fundação",
            activities: [
              {
                name: "Escavação",
                startDate: "2025-01-01",
                endDate: "2025-01-15",
              },
              {
                name: "Concretagem",
                startDate: "2025-01-16",
                endDate: "2025-01-30",
              },
            ],
          },
          {
            name: "Estrutura",
            activities: [
              {
                name: "Formas",
                startDate: "2025-02-01",
                endDate: "2025-02-15",
              },
            ],
          },
        ],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/macrostep/import`,
        {
          token: authToken,
          body: importData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("duplicates");
      expect(response.body).toHaveProperty("summary");
    });

    it("should return 400 when macrosteps array is missing", async () => {
      // Arrange
      const invalidData = {};

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/macrostep/import`,
        {
          token: authToken,
          body: invalidData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 401 without authentication", async () => {
      // Arrange
      const importData = { macrosteps: [] };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/macrostep/import`,
        {
          body: importData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
