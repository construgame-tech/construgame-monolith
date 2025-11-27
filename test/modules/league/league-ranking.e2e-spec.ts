import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createToken, faker, getRequest } from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("LeagueRankingController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let leagueId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    userId = faker.uuid();
    organizationId = faker.uuid();
    leagueId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("GET /api/v1/leagues/:leagueId/ranking", () => {
    it("should return league ranking", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/leagues/${leagueId}/ranking`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("ranking");
      expect(Array.isArray(response.body.ranking)).toBe(true);
    });

    it("should accept groupBy query parameter", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/leagues/${leagueId}/ranking`,
        {
          token: authToken,
          query: { groupBy: "project" },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("ranking");
    });

    it("should accept sectorId query parameter", async () => {
      // Arrange
      const sectorId = faker.uuid();

      // Act
      const response = await getRequest(
        app,
        `/api/v1/leagues/${leagueId}/ranking`,
        {
          token: authToken,
          query: { sectorId },
        },
      );

      // Assert
      expect(response.statusCode).toBe(200);
    });
  });
});

describe("LeagueReportsController (e2e)", () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let leagueId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    userId = faker.uuid();
    organizationId = faker.uuid();
    leagueId = faker.uuid();
    authToken = createToken(userId, organizationId, ["owner"]);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/most-replicated-kaizens", () => {
    it("should return most replicated kaizens report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/most-replicated-kaizens`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizen-counters", () => {
    it("should return kaizen counters report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizen-counters`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("projectCount");
      expect(response.body).toHaveProperty("kaizenCount");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-per-project-per-participant", () => {
    it("should return kaizens per project per participant report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-per-project-per-participant`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-per-project", () => {
    it("should return kaizens per project report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-per-project`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-per-week", () => {
    it("should return kaizens per week report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-per-week`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-per-sector", () => {
    it("should return kaizens per sector report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-per-sector`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-per-position", () => {
    it("should return kaizens per position report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-per-position`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-per-type", () => {
    it("should return kaizens per type report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-per-type`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-per-benefit", () => {
    it("should return kaizens per benefit report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-per-benefit`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-per-type-per-project", () => {
    it("should return kaizens per type per project report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-per-type-per-project`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-adherence-percentage", () => {
    it("should return kaizens adherence percentage report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-adherence-percentage`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-adherence", () => {
    it("should return kaizens adherence report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-adherence`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });

  describe("GET /api/v1/organization/:organizationId/league/:leagueId/report/kaizens-participants-per-project", () => {
    it("should return kaizens participants per project report", async () => {
      // Act
      const response = await getRequest(
        app,
        `/api/v1/organization/${organizationId}/league/${leagueId}/report/kaizens-participants-per-project`,
        { token: authToken },
      );

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("items");
    });
  });
});
