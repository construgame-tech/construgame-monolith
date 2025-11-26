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

describe("TeamController (e2e)", () => {
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

  describe("POST /api/v1/organizations/:organizationId/teams", () => {
    it("should create a new team", async () => {
      // Arrange
      const teamData = {
        name: "Equipe de Fundação",
        description: "Equipe responsável pela fundação",
        color: "#FF5733",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams`,
        {
          token: authToken,
          body: teamData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: teamData.name,
        description: teamData.description,
        color: teamData.color,
      });
    });

    it("should create team with minimal data", async () => {
      // Arrange
      const teamData = {
        name: "Equipe Mínima",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams`,
        {
          token: authToken,
          body: teamData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe(teamData.name);
    });

    it("should return 400 when required fields are missing", async () => {
      // Arrange
      const invalidData = {
        description: "Equipe sem nome",
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams`,
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
      const teamData = {
        name: "Test Team",
        organizationId,
        projectId,
      };

      // Act
      const response = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams`,
        {
          body: teamData,
        },
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/organizations/:organizationId/teams/:teamId", () => {
    it("should get a team by id", async () => {
      // Arrange - Create team first
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams`,
        {
          token: authToken,
          body: {
            name: "Equipe para Consulta",
          },
        },
      );

      const teamId = createResponse.body.id;

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams/${teamId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: teamId,
        name: "Equipe para Consulta",
      });
    });

    it("should return 404 when team does not exist", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams/${nonExistentId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/organizations/:organizationId/teams", () => {
    it("should list all teams for a project", async () => {
      // Arrange - Create at least 2 teams
      await postRequest(app, `/api/v1/organizations/${organizationId}/teams`, {
        token: authToken,
        body: {
          name: "Equipe List 1",
        },
      });

      await postRequest(app, `/api/v1/organizations/${organizationId}/teams`, {
        token: authToken,
        body: {
          name: "Equipe List 2",
        },
      });

      // Act
      const response = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams`,
        {
          token: authToken,
          query: { projectId },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("PUT /api/v1/organizations/:organizationId/teams/:teamId", () => {
    it("should update a team", async () => {
      // Arrange - Create team
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams`,
        {
          token: authToken,
          body: {
            name: "Equipe Original",
            color: "#000000",
          },
        },
      );

      const teamId = createResponse.body.id;

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams/${teamId}`,
        {
          token: authToken,
          body: {
            name: "Equipe Atualizada",
            description: "Descrição atualizada",
            color: "#FFFFFF",
          },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe("Equipe Atualizada");
      expect(response.body.description).toBe("Descrição atualizada");
      expect(response.body.color).toBe("#FFFFFF");
    });

    it("should return 404 when updating non-existent team", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await putRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams/${nonExistentId}`,
        {
          token: authToken,
          body: { name: "Test" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/organizations/:organizationId/teams/:teamId", () => {
    it("should delete a team", async () => {
      // Arrange - Create team
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams`,
        {
          token: authToken,
          body: {
            name: "Equipe para Deletar",
          },
        },
      );

      const teamId = createResponse.body.id;

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams/${teamId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(204);

      // Verify it was deleted
      const getResponse = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams/${teamId}`,
        {
          token: authToken,
        },
      );

      expect(getResponse.statusCode).toBe(404);
    });

    it("should return 404 when deleting non-existent team", async () => {
      // Arrange
      const nonExistentId = faker.uuid();

      // Act
      const response = await deleteRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams/${nonExistentId}`,
        {
          token: authToken,
        },
      );

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete team lifecycle", async () => {
      // Arrange & Act - Create
      const createResponse = await postRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams`,
        {
          token: authToken,
          body: {
            name: "Lifecycle Team",
            description: "Equipe completa",
            color: "#00FF00",
          },
        },
      );

      expect(createResponse.statusCode).toBe(201);
      const teamId = createResponse.body.id;

      // Act - Get
      const getResponse = await getRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams/${teamId}`,
        {
          token: authToken,
        },
      );

      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.name).toBe("Lifecycle Team");

      // Act - Update
      const updateResponse = await putRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams/${teamId}`,
        {
          token: authToken,
          body: {
            name: "Updated Lifecycle Team",
            description: "Equipe atualizada",
          },
        },
      );

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.body.name).toBe("Updated Lifecycle Team");

      // Act - Delete
      const deleteResponse = await deleteRequest(
        app,
        `/api/v1/organizations/${organizationId}/teams/${teamId}`,
        {
          token: authToken,
        },
      );

      expect(deleteResponse.statusCode).toBe(204);
    });

    it("should handle teams with different colors", async () => {
      // Arrange
      const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"];

      // Act & Assert
      for (const color of colors) {
        const response = await postRequest(
          app,
          `/api/v1/organizations/${organizationId}/teams`,
          {
            token: authToken,
            body: {
              name: `Equipe ${color}`,
              color,
            },
          },
        );

        expect(response.statusCode).toBe(201);
        expect(response.body.color).toBe(color);
      }
    });
  });
});
