import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createToken,
  deleteRequest,
  faker,
  getRequest,
  postRequest,
} from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("TaskTemplateController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let organizationId: string;
  let userId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    // Setup test data
    organizationId = faker.uuid();
    userId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ===========================================
  // Checklist Template Routes
  // ===========================================
  describe("GET /api/v1/organization/:organizationId/checklist-template", () => {
    it("should list checklist templates for organization", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/checklist-template`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });

  describe("POST /api/v1/organization/:organizationId/checklist-template", () => {
    it("should create a checklist template", async () => {
      // Arrange
      const checklistTemplateData = {
        name: "Safety Checklist Template",
        checklist: [
          { label: "Check EPIs" },
          { label: "Verify fire extinguisher" },
          { label: "Check signage" },
        ],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/checklist-template`,
        {
          token: authToken,
          body: checklistTemplateData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe("Safety Checklist Template");
      expect(response.body.organizationId).toBe(organizationId);
      expect(response.body.checklist).toHaveLength(3);
      expect(response.body.checklist[0]).toHaveProperty("id");
      expect(response.body.checklist[0].label).toBe("Check EPIs");
    });

    it("should create checklist template with custom item IDs", async () => {
      // Arrange
      const customId = faker.uuid();
      const checklistTemplateData = {
        name: "Custom ID Checklist",
        checklist: [
          { id: customId, label: "Custom Item" },
          { label: "Auto-ID Item" },
        ],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/checklist-template`,
        {
          token: authToken,
          body: checklistTemplateData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.checklist[0].id).toBe(customId);
      expect(response.body.checklist[1]).toHaveProperty("id");
    });

    it("should create empty checklist template", async () => {
      // Arrange
      const checklistTemplateData = {
        name: "Empty Checklist Template",
        checklist: [],
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/checklist-template`,
        {
          token: authToken,
          body: checklistTemplateData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.checklist).toHaveLength(0);
    });
  });

  describe("DELETE /api/v1/organization/:organizationId/checklist-template/:checklistTemplateId", () => {
    it("should delete a checklist template", async () => {
      // Arrange - Create a template first
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/checklist-template`,
        {
          token: authToken,
          body: {
            name: "Template to Delete",
            checklist: [{ label: "Item 1" }],
          },
        },
      );
      const checklistTemplateId = createResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/checklist-template/${checklistTemplateId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Checklist template deleted");
    });

    it("should return 404 when deleting non-existent template", async () => {
      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${organizationId}/checklist-template/${faker.uuid()}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });

    it("should return 404 when organization does not match", async () => {
      // Arrange - Create a template in original org
      const createResponse = await postRequest(
        app,
        `/api/v1/organization/${organizationId}/checklist-template`,
        {
          token: authToken,
          body: {
            name: "Org Mismatch Template",
            checklist: [{ label: "Item" }],
          },
        },
      );
      const checklistTemplateId = createResponse.body.id;

      // Act - Try to delete with different org ID
      const differentOrgId = faker.uuid();
      const differentToken = createToken(userId, differentOrgId, ["owner"]);
      const response = await deleteRequest(
        app,
        `/api/v1/organization/${differentOrgId}/checklist-template/${checklistTemplateId}`,
        {
          token: differentToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("Checklist Template CRUD Lifecycle", () => {
    it("should handle complete lifecycle: create, list, delete", async () => {
      const testOrgId = faker.uuid();
      const testToken = createToken(userId, testOrgId, ["owner"]);

      // Create multiple templates
      const template1 = await postRequest(
        app,
        `/api/v1/organization/${testOrgId}/checklist-template`,
        {
          token: testToken,
          body: {
            name: "Lifecycle Template 1",
            checklist: [{ label: "Item A" }],
          },
        },
      );
      expect(template1.statusCode).toBe(201);

      const template2 = await postRequest(
        app,
        `/api/v1/organization/${testOrgId}/checklist-template`,
        {
          token: testToken,
          body: {
            name: "Lifecycle Template 2",
            checklist: [{ label: "Item B" }, { label: "Item C" }],
          },
        },
      );
      expect(template2.statusCode).toBe(201);

      // List templates
      const listResponse = await getRequest(
        app,
        `/api/v1/organization/${testOrgId}/checklist-template`,
        {
          token: testToken,
        },
      );
      expect(listResponse.statusCode).toBe(200);
      expect(listResponse.body.items.length).toBeGreaterThanOrEqual(2);

      // Delete first template
      const deleteResponse = await deleteRequest(
        app,
        `/api/v1/organization/${testOrgId}/checklist-template/${template1.body.id}`,
        {
          token: testToken,
        },
      );
      expect(deleteResponse.statusCode).toBe(200);

      // Verify it's gone
      const listAfterDelete = await getRequest(
        app,
        `/api/v1/organization/${testOrgId}/checklist-template`,
        {
          token: testToken,
        },
      );
      const templateIds = listAfterDelete.body.items.map((t: any) => t.id);
      expect(templateIds).not.toContain(template1.body.id);
      expect(templateIds).toContain(template2.body.id);
    });
  });

  describe("Authentication", () => {
    it("should return 401 when no token provided", async () => {
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/checklist-template`,
        {},
      );

      expect(response.statusCode).toBe(401);
    });

    it("should return 401 when invalid token provided", async () => {
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/checklist-template`,
        {
          token: "invalid-token",
        },
      );

      expect(response.statusCode).toBe(401);
    });
  });
});
