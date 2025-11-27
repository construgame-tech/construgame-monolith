import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createToken, faker, getRequest } from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("GlobalPrizeController (e2e)", () => {
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

  describe("GET /api/v1/prize", () => {
    it("should return list of global prizes", async () => {
      // Act
      const response = await getRequest(app, "/api/v1/prize", {
        token: authToken,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      // Act
      const response = await getRequest(app, "/api/v1/prize", {});

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/organization/:organizationId/:resourceType/:resourceId/prize", () => {
    it("should return prizes for project resource", async () => {
      // Arrange
      const projectId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/project/${projectId}/prize`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should return prizes for user resource", async () => {
      // Arrange
      const targetUserId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${targetUserId}/prize`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should return prizes for member resource", async () => {
      // Arrange
      const memberId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/member/${memberId}/prize`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should return prizes for task resource", async () => {
      // Arrange
      const taskId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/task/${taskId}/prize`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should return prizes for activity resource", async () => {
      // Arrange
      const activityId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/activity/${activityId}/prize`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });
});
