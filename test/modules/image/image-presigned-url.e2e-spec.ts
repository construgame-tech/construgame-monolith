import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createToken, faker, postRequest } from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("ImageController Presigned URL (e2e)", () => {
  let app: NestFastifyApplication;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    app = await setupTestApp();

    userId = faker.uuid();
    token = createToken(userId);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("POST /api/v1/image/bucket/presigned-url", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/image/bucket/presigned-url",
        { query: { extension: "png" } },
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return 400 when extension is missing", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/image/bucket/presigned-url",
        { token },
      );

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when extension is invalid", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/image/bucket/presigned-url",
        {
          token,
          query: { extension: "exe" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return presigned url for valid png extension", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/image/bucket/presigned-url",
        {
          token,
          query: { extension: "png" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("url");
      expect(typeof response.body.url).toBe("string");
    });

    it("should return presigned url for valid jpeg extension", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/image/bucket/presigned-url",
        {
          token,
          query: { extension: "jpeg" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("url");
    });

    it("should return presigned url for valid jpg extension", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/image/bucket/presigned-url",
        {
          token,
          query: { extension: "jpg" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("url");
    });

    it("should return presigned url for valid webp extension", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/image/bucket/presigned-url",
        {
          token,
          query: { extension: "webp" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("url");
    });
  });

  describe("POST /api/v1/file/bucket/presigned-url", () => {
    it("should return 401 when no auth token is provided", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/file/bucket/presigned-url",
        { query: { extension: "pdf" } },
      );

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return 400 when extension is missing", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/file/bucket/presigned-url",
        { token },
      );

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return presigned url for pdf extension", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/file/bucket/presigned-url",
        {
          token,
          query: { extension: "pdf" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("url");
      expect(typeof response.body.url).toBe("string");
    });

    it("should return presigned url for docx extension", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/file/bucket/presigned-url",
        {
          token,
          query: { extension: "docx" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("url");
    });

    it("should return presigned url for xlsx extension", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/file/bucket/presigned-url",
        {
          token,
          query: { extension: "xlsx" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("url");
    });

    it("should return presigned url for any custom extension", async () => {
      // Act
      const response = await postRequest(
        app,
        "/api/v1/file/bucket/presigned-url",
        {
          token,
          query: { extension: "custom" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("url");
    });
  });
});
