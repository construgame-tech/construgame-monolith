import type { NestFastifyApplication } from "@nestjs/platform-fastify";
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

describe("ProjectController (e2e)", () => {
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

  describe("POST /api/v1/organizations/:organizationId/projects", () => {
    it("should create a new project", async () => {
      // Arrange
      const projectData = {
        name: "Edifício Residencial Solar",
        startDate: "2024-01-01",
        endDate: "2025-12-31",
        city: "São Paulo",
        state: "SP",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          token: authToken,
          body: projectData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: projectData.name,
        organizationId,
        city: projectData.city,
        state: projectData.state,
      });
    });

    it("should create project with minimal data", async () => {
      // Arrange
      const projectData = {
        name: "Projeto Mínimo",
        organizationId,
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          token: authToken,
          body: projectData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe(projectData.name);
    });

    it("should return 400 when required fields are missing", async () => {
      // Arrange
      const invalidData = {
        city: "São Paulo",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
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
      const projectData = {
        name: "Test Project",
        organizationId,
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          body: projectData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/organizations/:organizationId/projects/:projectId", () => {
    it("should get a project by id", async () => {
      // Arrange - Create project first
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          token: authToken,
          body: {
            name: "Projeto para Consulta",
            organizationId,
          },
        },
      );

      const projectId = createResponse.body.id;

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: projectId,
        name: "Projeto para Consulta",
      });
    });

    it("should return 404 when project does not exist", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${nonExistentId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/organizations/:organizationId/projects", () => {
    it("should list all projects for an organization", async () => {
      // Arrange - Create at least 2 projects
      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          token: authToken,
          body: { name: "Projeto List 1", organizationId },
        },
      );

      await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          token: authToken,
          body: { name: "Projeto List 2", organizationId },
        },
      );

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          token: authToken,
          query: { organizationId },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("PUT /api/v1/organizations/:organizationId/projects/:projectId", () => {
    it("should update a project", async () => {
      // Arrange - Create project
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          token: authToken,
          body: {
            name: "Projeto Original",
          },
        },
      );

      const projectId = createResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}`,
        {
          token: authToken,
          body: {
            name: "Projeto Atualizado",
            city: "Rio de Janeiro",
            state: "RJ",
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe("Projeto Atualizado");
      expect(response.body.city).toBe("Rio de Janeiro");
    });

    it("should return 404 when updating non-existent project", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${nonExistentId}`,
        {
          token: authToken,
          body: { name: "Test" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/organizations/:organizationId/projects/:projectId", () => {
    it("should delete a project", async () => {
      // Arrange - Create project
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          token: authToken,
          body: {
            name: "Projeto para Deletar",
            organizationId,
          },
        },
      );

      const projectId = createResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(204);

      // Verify it was deleted
      const getResponse = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}`,
        {
          token: authToken,
        },
      );

      expect(getResponse.statusCode).toBe(404);
    });

    it("should return 404 when deleting non-existent project", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${nonExistentId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete project lifecycle", async () => {
      // Arrange & Act - Create
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          token: authToken,
          body: {
            name: "Lifecycle Project",
            city: "Belo Horizonte",
            state: "MG",
            startDate: "2024-06-01",
            endDate: "2025-06-01",
          },
        },
      );

      expect(createResponse.statusCode).toBe(201);
      const projectId = createResponse.body.id;

      // Act - Get
      const getResponse = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}`,
        {
          token: authToken,
        },
      );

      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.name).toBe("Lifecycle Project");

      // Act - Update
      const updateResponse = await putRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}`,
        {
          token: authToken,
          body: {
            name: "Updated Lifecycle Project",
          },
        },
      );

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.body.name).toBe("Updated Lifecycle Project");

      // Act - Delete
      const deleteResponse = await deleteRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects/${projectId}`,
        {
          token: authToken,
        },
      );

      expect(deleteResponse.statusCode).toBe(204);
    });

    it("should handle projects with complete address information", async () => {
      // Arrange
      const projectData = {
        name: "Projeto Endereço Completo",
        city: "São Paulo",
        state: "SP",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/projects`,
        {
          token: authToken,
          body: projectData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.city).toBe(projectData.city);
      expect(response.body.state).toBe(projectData.state);
    });
  });
});
