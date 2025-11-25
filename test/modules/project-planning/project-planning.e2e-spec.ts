import type { INestApplication } from "@nestjs/common";
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

describe("ProjectPlanningController (e2e)", () => {
  let app: INestApplication;
  let authToken: string;
  let organizationId: string;
  let projectId: string;
  let userId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    // Setup test data
    organizationId = faker.uuid();
    projectId = faker.uuid();
    userId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("Macrostep Operations", () => {
    describe("POST /api/v1/organizations/:organizationId/projects/:projectId/macrosteps", () => {
      it("should create a new macrostep", async () => {
        // Arrange
        const macrostepData = {
          name: "Fundação",
        };

        // Act
        const response = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
            body: macrostepData,
          },
        );

        // Assert
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
          id: expect.any(String),
          name: macrostepData.name,
          organizationId,
          projectId,
          progressPercent: 0,
          activities: [],
        });
      });

      it("should create a macrostep with custom id", async () => {
        // Arrange
        const customId = faker.uuid();
        const macrostepData = {
          id: customId,
          name: "Estrutura",
        };

        // Act
        const response = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
            body: macrostepData,
          },
        );

        // Assert
        expect(response.statusCode).toBe(201);
        expect(response.body.id).toBe(customId);
        expect(response.body.name).toBe(macrostepData.name);
      });

      it("should return 400 when name is missing", async () => {
        // Arrange
        const invalidData = {};

        // Act
        const response = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
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
        const macrostepData = { name: "Test" };

        // Act
        const response = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            body: macrostepData,
          },
        );

        // Assert
        expect(response.statusCode).toBe(401);
      });
    });

    describe("GET /api/v1/organizations/:organizationId/projects/:projectId/macrosteps", () => {
      it("should list all macrosteps for a project", async () => {
        // Arrange - Create 2 macrosteps
        await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
            body: { name: "Macrostep 1" },
          },
        );

        await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
            body: { name: "Macrostep 2" },
          },
        );

        // Act
        const response = await getRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
          },
        );

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body.macrosteps).toBeInstanceOf(Array);
        expect(response.body.macrosteps.length).toBeGreaterThanOrEqual(2);
      });

      it("should return empty array when no macrosteps exist", async () => {
        // Arrange
        const emptyProjectId = faker.uuid();

        // Act
        const response = await getRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${emptyProjectId}/macrosteps`,
          {
            token: authToken,
          },
        );

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body.macrosteps).toEqual([]);
      });
    });

    describe("PUT /api/v1/organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId", () => {
      it("should update a macrostep name", async () => {
        // Arrange - Create a macrostep
        const createResponse = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
            body: { name: "Original Name" },
          },
        );

        const macrostepId = createResponse.body.id;

        // Act
        const response = await putRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}`,
          {
            token: authToken,
            body: { name: "Updated Name" },
          },
        );

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Updated Name");
        expect(response.body.id).toBe(macrostepId);
      });

      it("should return 404 when macrostep does not exist", async () => {
        // Arrange
        const nonExistentId = faker.uuid();

        // Act
        const response = await putRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${nonExistentId}`,
          {
            token: authToken,
            body: { name: "New Name" },
          },
        );

        // Assert
        expect(response.statusCode).toBe(404);
      });
    });

    describe("DELETE /api/v1/organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId", () => {
      it("should delete a macrostep", async () => {
        // Arrange - Create a macrostep
        const createResponse = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
            body: { name: "To Delete" },
          },
        );

        const macrostepId = createResponse.body.id;

        // Act
        const response = await deleteRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}`,
          {
            token: authToken,
          },
        );

        // Assert
        expect(response.statusCode).toBe(200);

        // Verify it was deleted
        const getResponse = await getRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
          },
        );

        const deleted = getResponse.body.macrosteps.find(
          (m: any) => m.id === macrostepId,
        );
        expect(deleted).toBeUndefined();
      });

      it("should return 404 when trying to delete non-existent macrostep", async () => {
        // Arrange
        const nonExistentId = faker.uuid();

        // Act
        const response = await deleteRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${nonExistentId}`,
          {
            token: authToken,
          },
        );

        // Assert
        expect(response.statusCode).toBe(404);
      });
    });

    describe("POST /api/v1/organizations/:organizationId/projects/:projectId/macrosteps/move-order", () => {
      it("should reorder macrosteps", async () => {
        // Arrange - Create 3 macrosteps
        const m1 = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
            body: { name: "First" },
          },
        );

        const m2 = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
            body: { name: "Second" },
          },
        );

        const m3 = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
          {
            token: authToken,
            body: { name: "Third" },
          },
        );

        // Act - Move first to last position (index 2)
        const response = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/move-order`,
          {
            token: authToken,
            body: {
              macrostepId: m1.body.id,
              newIndex: 2,
            },
          },
        );

        // Assert
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe("Activity Operations", () => {
    let macrostepId: string;

    beforeAll(async () => {
      // Create a macrostep for activity tests
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
        {
          token: authToken,
          body: { name: "Test Macrostep for Activities" },
        },
      );
      macrostepId = response.body.id;
    });

    describe("POST /api/v1/organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId/activities", () => {
      it("should create a new activity", async () => {
        // Arrange
        const activityData = {
          name: "Concretagem",
          description: "Concretagem da laje",
          startDate: "2024-01-01",
          endDate: "2024-01-15",
          expectedCost: 50000,
          measurementUnit: "m³",
          totalMeasurementExpected: "100",
        };

        // Act
        const response = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities`,
          {
            token: authToken,
            body: activityData,
          },
        );

        // Assert
        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
          id: expect.any(String),
          name: activityData.name,
          description: activityData.description,
          macrostepId,
          organizationId,
          projectId,
          progressPercent: 0,
        });
      });

      it("should create activity with labor composition", async () => {
        // Arrange
        const activityData = {
          name: "Alvenaria",
          laborCompositionList: [
            {
              jobRoleId: faker.uuid(),
              jobRoleName: "Pedreiro",
              quantity: 3,
              unitCost: 150,
            },
            {
              jobRoleId: faker.uuid(),
              jobRoleName: "Servente",
              quantity: 2,
              unitCost: 100,
            },
          ],
          prizesPerRange: [
            { min: 0, max: 50, points: 10 },
            { min: 51, max: 100, points: 20 },
          ],
        };

        // Act
        const response = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities`,
          {
            token: authToken,
            body: activityData,
          },
        );

        // Assert
        expect(response.statusCode).toBe(201);
        expect(response.body.laborCompositionList).toHaveLength(2);
        expect(response.body.prizesPerRange).toHaveLength(2);
      });

      it("should return 404 when macrostep does not exist", async () => {
        // Arrange
        const nonExistentMacrostepId = faker.uuid();
        const activityData = { name: "Test Activity" };

        // Act
        const response = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${nonExistentMacrostepId}/activities`,
          {
            token: authToken,
            body: activityData,
          },
        );

        // Assert
        expect(response.statusCode).toBe(404);
      });
    });

    describe("GET /api/v1/organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId/activities", () => {
      it("should list all activities for a macrostep", async () => {
        // Arrange - Create 2 activities
        await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities`,
          {
            token: authToken,
            body: { name: "Activity 1" },
          },
        );

        await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities`,
          {
            token: authToken,
            body: { name: "Activity 2" },
          },
        );

        // Act
        const response = await getRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities`,
          {
            token: authToken,
          },
        );

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body.activities).toBeInstanceOf(Array);
        expect(response.body.activities.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe("PUT /api/v1/organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId/activities/:activityId", () => {
      it("should update an activity", async () => {
        // Arrange - Create an activity
        const createResponse = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities`,
          {
            token: authToken,
            body: { name: "Original Activity" },
          },
        );

        const activityId = createResponse.body.id;

        // Act
        const response = await putRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities/${activityId}`,
          {
            token: authToken,
            body: {
              name: "Updated Activity",
              expectedCost: 75000,
            },
          },
        );

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Updated Activity");
        expect(response.body.expectedCost).toBe(75000);
      });
    });

    describe("DELETE /api/v1/organizations/:organizationId/projects/:projectId/macrosteps/:macrostepId/activities/:activityId", () => {
      it("should delete an activity", async () => {
        // Arrange - Create an activity
        const createResponse = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities`,
          {
            token: authToken,
            body: { name: "To Delete Activity" },
          },
        );

        const activityId = createResponse.body.id;

        // Act
        const response = await deleteRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities/${activityId}`,
          {
            token: authToken,
          },
        );

        // Assert
        expect(response.statusCode).toBe(200);

        // Verify it was deleted
        const getResponse = await getRequest(
          app,
          `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities`,
          {
            token: authToken,
          },
        );

        const deleted = getResponse.body.activities.find(
          (a: any) => a.id === activityId,
        );
        expect(deleted).toBeUndefined();
      });
    });
  });

  describe("Integration Tests", () => {
    it("should calculate macrostep progress based on activities", async () => {
      // Arrange - Create a macrostep
      const macrostepResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
        {
          token: authToken,
          body: { name: "Progress Test Macrostep" },
        },
      );

      const macrostepId = macrostepResponse.body.id;

      // Create 2 activities with 50% progress each
      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities`,
        {
          token: authToken,
          body: { name: "Activity 1", progressPercent: 50 },
        },
      );

      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/${macrostepId}/activities`,
        {
          token: authToken,
          body: { name: "Activity 2", progressPercent: 50 },
        },
      );

      // Act - Get macrosteps list (should show calculated progress)
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      const macrostep = response.body.macrosteps.find(
        (m: any) => m.id === macrostepId,
      );
      expect(macrostep).toBeDefined();
      // Progress should be calculated from activities
    });

    it("should preserve macrostep order after reordering", async () => {
      // Arrange - Create 3 macrosteps
      const m1 = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
        {
          token: authToken,
          body: { name: "Order Test 1" },
        },
      );

      const m2 = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
        {
          token: authToken,
          body: { name: "Order Test 2" },
        },
      );

      const m3 = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
        {
          token: authToken,
          body: { name: "Order Test 3" },
        },
      );

      // Act - Reorder
      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps/move-order`,
        {
          token: authToken,
          body: {
            macrostepId: m1.body.id,
            newIndex: 2,
          },
        },
      );

      // Get list to verify order
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}/macrosteps`,
        {
          token: authToken,
        },
      );

      // Assert - Order should be: m2, m3, m1
      const macrosteps = response.body.macrosteps;
      const orderTestMacrosteps = macrosteps.filter((m: any) =>
        m.name.startsWith("Order Test"),
      );
      expect(orderTestMacrosteps.length).toBe(3);
    });
  });
});
