import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createToken, faker, postRequest } from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("TeamController - Import (e2e)", () => {
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

  describe("POST /api/v1/organization/:organizationId/team/import", () => {
    it("should import teams in bulk", async () => {
      // Arrange
      const importData = {
        teams: [
          {
            name: "Equipe Alpha",
            fieldOfAction: "Fundações",
          },
          {
            name: "Equipe Beta",
            fieldOfAction: "Estruturas",
          },
        ],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/team/import`,
        {
          token: authToken,
          body: importData,
        },
      );

      // Assert - rota retorna 201
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("duplicates");
    });

    it("should return 400 when teams array is missing", async () => {
      // Arrange
      const invalidData = {};

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/team/import`,
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
      const importData = { teams: [] };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/team/import`,
        {
          body: importData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
