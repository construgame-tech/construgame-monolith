import { describe, it, expect } from "vitest";
import {
  createUserKaizenPointsEntity,
  addPointsToUserKaizenPoints,
  type UserKaizenPointsEntity,
} from "./user-kaizen-points.entity";
import {
  createTeamKaizenPointsEntity,
  addPointsToTeamKaizenPoints,
  type TeamKaizenPointsEntity,
} from "./team-kaizen-points.entity";
import {
  createGameKaizenPointsEntity,
  addPointsToGameKaizenPoints,
  type GameKaizenPointsEntity,
} from "./game-kaizen-points.entity";

describe("KaizenPointsEntities", () => {
  describe("UserKaizenPointsEntity", () => {
    describe("createUserKaizenPointsEntity", () => {
      const validInput = {
        userId: "user-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
      };

      it("should create entity with required fields", () => {
        const points = createUserKaizenPointsEntity(validInput);

        expect(points.userId).toBe("user-123");
        expect(points.organizationId).toBe("org-123");
        expect(points.projectId).toBe("proj-123");
        expect(points.gameId).toBe("game-123");
      });

      it("should initialize points to 0", () => {
        const points = createUserKaizenPointsEntity(validInput);

        expect(points.points).toBe(0);
      });

      it("should set sequence to 0 by default", () => {
        const points = createUserKaizenPointsEntity(validInput);

        expect(points.sequence).toBe(0);
      });
    });

    describe("addPointsToUserKaizenPoints", () => {
      const existingPoints: UserKaizenPointsEntity = {
        userId: "user-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        points: 100,
        sequence: 1,
      };

      it("should add points to current total", () => {
        const updated = addPointsToUserKaizenPoints(existingPoints, 50);

        expect(updated.points).toBe(150);
      });

      it("should increment sequence", () => {
        const updated = addPointsToUserKaizenPoints(existingPoints, 50);

        expect(updated.sequence).toBe(2);
      });

      it("should preserve other fields", () => {
        const updated = addPointsToUserKaizenPoints(existingPoints, 50);

        expect(updated.userId).toBe("user-123");
        expect(updated.organizationId).toBe("org-123");
        expect(updated.projectId).toBe("proj-123");
        expect(updated.gameId).toBe("game-123");
      });

      it("should handle adding zero points", () => {
        const updated = addPointsToUserKaizenPoints(existingPoints, 0);

        expect(updated.points).toBe(100);
        expect(updated.sequence).toBe(2);
      });

      it("should handle negative points (deduction)", () => {
        const updated = addPointsToUserKaizenPoints(existingPoints, -30);

        expect(updated.points).toBe(70);
      });

      it("should handle consecutive additions", () => {
        const first = addPointsToUserKaizenPoints(existingPoints, 25);
        const second = addPointsToUserKaizenPoints(first, 25);

        expect(second.points).toBe(150);
        expect(second.sequence).toBe(3);
      });
    });
  });

  describe("TeamKaizenPointsEntity", () => {
    describe("createTeamKaizenPointsEntity", () => {
      const validInput = {
        teamId: "team-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
      };

      it("should create entity with required fields", () => {
        const points = createTeamKaizenPointsEntity(validInput);

        expect(points.teamId).toBe("team-123");
        expect(points.organizationId).toBe("org-123");
        expect(points.projectId).toBe("proj-123");
        expect(points.gameId).toBe("game-123");
      });

      it("should initialize points to 0", () => {
        const points = createTeamKaizenPointsEntity(validInput);

        expect(points.points).toBe(0);
      });

      it("should set sequence to 0 by default", () => {
        const points = createTeamKaizenPointsEntity(validInput);

        expect(points.sequence).toBe(0);
      });
    });

    describe("addPointsToTeamKaizenPoints", () => {
      const existingPoints: TeamKaizenPointsEntity = {
        teamId: "team-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        points: 200,
        sequence: 2,
      };

      it("should add points to current total", () => {
        const updated = addPointsToTeamKaizenPoints(existingPoints, 100);

        expect(updated.points).toBe(300);
      });

      it("should increment sequence", () => {
        const updated = addPointsToTeamKaizenPoints(existingPoints, 100);

        expect(updated.sequence).toBe(3);
      });

      it("should preserve other fields", () => {
        const updated = addPointsToTeamKaizenPoints(existingPoints, 100);

        expect(updated.teamId).toBe("team-123");
        expect(updated.organizationId).toBe("org-123");
      });
    });
  });

  describe("GameKaizenPointsEntity", () => {
    describe("createGameKaizenPointsEntity", () => {
      const validInput = {
        gameId: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
      };

      it("should create entity with required fields", () => {
        const points = createGameKaizenPointsEntity(validInput);

        expect(points.gameId).toBe("game-123");
        expect(points.organizationId).toBe("org-123");
        expect(points.projectId).toBe("proj-123");
      });

      it("should initialize points to 0", () => {
        const points = createGameKaizenPointsEntity(validInput);

        expect(points.points).toBe(0);
      });

      it("should set sequence to 0 by default", () => {
        const points = createGameKaizenPointsEntity(validInput);

        expect(points.sequence).toBe(0);
      });
    });

    describe("addPointsToGameKaizenPoints", () => {
      const existingPoints: GameKaizenPointsEntity = {
        gameId: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
        points: 500,
        sequence: 5,
      };

      it("should add points to current total", () => {
        const updated = addPointsToGameKaizenPoints(existingPoints, 150);

        expect(updated.points).toBe(650);
      });

      it("should increment sequence", () => {
        const updated = addPointsToGameKaizenPoints(existingPoints, 150);

        expect(updated.sequence).toBe(6);
      });

      it("should preserve other fields", () => {
        const updated = addPointsToGameKaizenPoints(existingPoints, 150);

        expect(updated.gameId).toBe("game-123");
        expect(updated.organizationId).toBe("org-123");
        expect(updated.projectId).toBe("proj-123");
      });

      it("should handle large points values", () => {
        const updated = addPointsToGameKaizenPoints(existingPoints, 999999);

        expect(updated.points).toBe(1000499);
      });
    });
  });
});
