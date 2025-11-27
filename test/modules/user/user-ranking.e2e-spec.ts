import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createToken, faker, getRequest } from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("UserRankingController (e2e)", () => {
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

  describe("GET /api/v1/organization/:organizationId/user/:userId/ranking", () => {
    it("should return user rankings", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${userId}/ranking`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("rankings");
      expect(Array.isArray(response.body.rankings)).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${userId}/ranking`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return empty rankings for user without rankings", async () => {
      // Arrange
      const newUserId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${newUserId}/ranking`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.rankings).toHaveLength(0);
    });
  });
});
