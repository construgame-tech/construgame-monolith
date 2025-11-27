import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createToken, faker, postRequest } from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("MemberController - Import (e2e)", () => {
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

  describe("POST /api/v1/organization/:organizationId/member/import", () => {
    it("should import members in bulk", async () => {
      // Arrange
      const importData = {
        members: [
          {
            name: "João Silva",
            email: "joao.silva@example.com",
            phone: "+5511999999999",
            role: "player",
          },
          {
            name: "Maria Santos",
            email: "maria.santos@example.com",
            phone: "+5511888888888",
            role: "player",
          },
        ],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/member/import`,
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

    it("should return 400 when members array is missing", async () => {
      // Arrange
      const invalidData = {};

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/member/import`,
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
      const importData = { members: [] };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/member/import`,
        {
          body: importData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
