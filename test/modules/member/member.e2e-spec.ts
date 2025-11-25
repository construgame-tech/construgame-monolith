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

describe("MemberController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let ownerId: string;
  let organizationId: string;
  let userId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    ownerId = faker.uuid();
    organizationId = faker.uuid();
    userId = faker.uuid();
    authToken = createToken(ownerId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("POST /api/v1/organizations/:organizationId/members", () => {
    it("should create a new member", async () => {
      // Arrange
      const memberData = {
        userId,
        role: "manager",
        jobRoleId: faker.uuid(),
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
        {
          token: authToken,
          body: memberData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        userId,
        organizationId,
        role: memberData.role,
        jobRoleId: memberData.jobRoleId,
      });
    });

    it("should create member with minimal data", async () => {
      // Arrange
      const memberData = {
        userId: faker.uuid(),
        role: "player", // Fixed: valid role
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
        {
          token: authToken,
          body: memberData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.userId).toBe(memberData.userId);
      expect(response.body.role).toBe(memberData.role);
    });

    it("should return 400 when required fields are missing", async () => {
      // Arrange
      const invalidData = {
        role: "player", // Valid role
        // Missing userId
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
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
      const memberData = {
        userId: faker.uuid(),
        role: "player",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
        {
          body: memberData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/organizations/:organizationId/members/:userId", () => {
    it("should get a member by userId", async () => {
      // Arrange - Create member first
      const newUserId = faker.uuid();
      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
        {
          token: authToken,
          body: {
            userId: newUserId,
            role: "manager",
          },
        },
      );

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/members/${newUserId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        userId: newUserId,
        organizationId,
        role: "manager",
      });
    });

    it("should return 404 when member does not exist", async () => {
      // Arrange
      const nonExistentUserId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/members/${nonExistentUserId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/organizations/:organizationId/members", () => {
    it("should list all members of an organization", async () => {
      // Arrange - Create at least 2 members
      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
        {
          token: authToken,
          body: {
            userId: faker.uuid(),
            role: "player",
          },
        },
      );

      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
        {
          token: authToken,
          body: {
            userId: faker.uuid(),
            role: "manager",
          },
        },
      );

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("PUT /api/v1/organizations/:organizationId/members/:userId", () => {
    it("should update a member", async () => {
      // Arrange - Create member
      const newUserId = faker.uuid();
      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
        {
          token: authToken,
          body: {
            userId: newUserId,
            role: "player",
          },
        },
      );

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organizations/${organizationId}/members/${newUserId}`,
        {
          token: authToken,
          body: {
            role: "manager",
            jobRoleId: faker.uuid(),
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.role).toBe("manager");
      expect(response.body.jobRoleId).toBeDefined();
    });

    it("should return 404 when updating non-existent member", async () => {
      // Arrange
      const nonExistentUserId = faker.uuid();

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organizations/${organizationId}/members/${nonExistentUserId}`,
        {
          token: authToken,
          body: { role: "manager" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/organizations/:organizationId/members/:userId", () => {
    it("should delete a member", async () => {
      // Arrange - Create member
      const newUserId = faker.uuid();
      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
        {
          token: authToken,
          body: {
            userId: newUserId,
            role: "player",
          },
        },
      );

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organizations/${organizationId}/members/${newUserId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(204);

      // Verify it was deleted
      const getResponse = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/members/${newUserId}`,
        {
          token: authToken,
        },
      );

      expect(getResponse.statusCode).toBe(404);
    });

    it("should return 404 when deleting non-existent member", async () => {
      // Arrange
      const nonExistentUserId = faker.uuid();

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organizations/${organizationId}/members/${nonExistentUserId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete member lifecycle", async () => {
      // Arrange & Act - Create
      const newUserId = faker.uuid();
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/members`,
        {
          token: authToken,
          body: {
            userId: newUserId,
            role: "player",
            jobRoleId: faker.uuid(),
          },
        },
      );

      expect(createResponse.statusCode).toBe(201);

      // Act - Get
      const getResponse = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/members/${newUserId}`,
        {
          token: authToken,
        },
      );

      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.userId).toBe(newUserId);

      // Act - Update
      const updateResponse = await putRequest(
        app,
        `/api/v1/organizations/${organizationId}/members/${newUserId}`,
        {
          token: authToken,
          body: {
            role: "manager",
          },
        },
      );

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.body.role).toBe("manager");

      // Act - Delete
      const deleteResponse = await deleteRequest(
        app,
        `/api/v1/organizations/${organizationId}/members/${newUserId}`,
        {
          token: authToken,
        },
      );

      expect(deleteResponse.statusCode).toBe(204);
    });

    it("should handle multiple members with different roles", async () => {
      // Arrange
      const roles = ["owner", "manager", "player"];

      // Act & Assert
      for (const role of roles) {
        const response = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/members`,
          {
            token: authToken,
            body: {
              userId: faker.uuid(),
              role,
            },
          },
        );

        expect(response.statusCode).toBe(201);
        expect(response.body.role).toBe(role);
      }
    });
  });
});
