import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createToken,
  faker,
  getRequest,
  postRequest,
  putRequest,
  testData,
} from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("NotificationOrgController (e2e)", () => {
  let app: NestFastifyApplication;
  let userId: string;
  let organizationId: string;
  let token: string;

  beforeAll(async () => {
    app = await setupTestApp();

    userId = faker.uuid();
    token = createToken(userId);

    // Create real test organization in database
    const orgResponse = await postRequest(app, "/api/v1/organization", {
      body: testData.organization({ ownerId: userId }),
      token,
    });
    organizationId = orgResponse.body.id;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("GET /api/v1/organization/:organizationId/user/:userId/notification", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${userId}/notification`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return notifications list with items array", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${userId}/notification`,
        { token },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it("should support status filter (UNREAD)", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${userId}/notification`,
        {
          token,
          query: { status: "UNREAD" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should support status filter (READ)", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${userId}/notification`,
        {
          token,
          query: { status: "READ" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should support status filter (ALL)", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${userId}/notification`,
        {
          token,
          query: { status: "ALL" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should support pagination with limit", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${userId}/notification`,
        {
          token,
          query: { limit: 5 },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("PUT /api/v1/organization/:organizationId/user/:userId/notification/:notificationId/read", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Arrange
      const notificationId = faker.uuid();

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${userId}/notification/${notificationId}/read`,
        {},
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should mark notification as read successfully", async () => {
      // Arrange - Use a fake notification ID (would work as the service handles non-existent gracefully)
      const notificationId = faker.uuid();

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organization/${organizationId}/user/${userId}/notification/${notificationId}/read`,
        { token },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("success");
      expect(response.body.success).toBe(true);
    });
  });
});
