import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createToken,
  faker,
  getRequest,
  postRequest,
  testData,
} from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("SearchController (e2e)", () => {
  let app: NestFastifyApplication;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    app = await setupTestApp();

    userId = faker.uuid();
    token = createToken(userId);

    // Create real test data in database for searching
    await postRequest(app, "/api/v1/organizations", {
      body: testData.organization({ ownerId: userId }),
      token,
    });
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("GET /api/v1/search/user", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await getRequest(app, "/api/v1/search/user", {
        query: { query: "test" },
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return 400 when query is missing", async () => {
      // Act
      const response = await getRequest(app, "/api/v1/search/user", {
        token,
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when query is too short", async () => {
      // Act
      const response = await getRequest(app, "/api/v1/search/user", {
        token,
        query: { query: "a" },
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return matching users when query is valid", async () => {
      // Act
      const response = await getRequest(app, "/api/v1/search/user", {
        token,
        query: { query: "test" },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it("should return empty array when no users match", async () => {
      // Act - Use a very unlikely search term
      const response = await getRequest(app, "/api/v1/search/user", {
        token,
        query: { query: "xyznonexistent123" },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual([]);
    });
  });

  describe("GET /api/v1/search/organization", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await getRequest(app, "/api/v1/search/organization", {
        query: { query: "test" },
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return 400 when query is missing", async () => {
      // Act
      const response = await getRequest(app, "/api/v1/search/organization", {
        token,
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when query is too short", async () => {
      // Act
      const response = await getRequest(app, "/api/v1/search/organization", {
        token,
        query: { query: "x" },
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return matching organizations when query is valid", async () => {
      // Act
      const response = await getRequest(app, "/api/v1/search/organization", {
        token,
        query: { query: "org" },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it("should return empty array when no organizations match", async () => {
      // Act - Use a very unlikely search term
      const response = await getRequest(app, "/api/v1/search/organization", {
        token,
        query: { query: "xyznonexistent999" },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual([]);
    });
  });
});
