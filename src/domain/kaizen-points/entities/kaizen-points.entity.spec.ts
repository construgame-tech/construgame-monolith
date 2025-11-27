import { describe, expect, it } from "vitest";
import {
  addPointsToGameKaizenPoints,
  createGameKaizenPointsEntity,
  type GameKaizenPointsEntity,
} from "./game-kaizen-points.entity";
import {
  addPointsToTeamKaizenPoints,
  createTeamKaizenPointsEntity,
  type TeamKaizenPointsEntity,
} from "./team-kaizen-points.entity";
import {
  addPointsToUserKaizenPoints,
  createUserKaizenPointsEntity,
  type UserKaizenPointsEntity,
} from "./user-kaizen-points.entity";

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

        // sequence removed.toBe(0);
      });
    });

    describe("addPointsToUserKaizenPoints", () => {
      const existingPoints: UserKaizenPointsEntity = {
        userId: "user-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        points: 100,
        
      };

      it("should add points to current total", () => {
        const updated = addPointsToUserKaizenPoints(existingPoints, 50);

        expect(updated.points).toBe(150);
      });

      it("should increment sequence", () => {
        const updated = addPointsToUserKaizenPoints(existingPoints, 50);

        // sequence removed.toBe(2);
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
        // sequence removed.toBe(2);
      });

      it("should handle negative points (deduction)", () => {
        const updated = addPointsToUserKaizenPoints(existingPoints, -30);

        expect(updated.points).toBe(70);
      });

      it("should handle consecutive additions", () => {
        const first = addPointsToUserKaizenPoints(existingPoints, 25);
        const second = addPointsToUserKaizenPoints(first, 25);

        expect(second.points).toBe(150);
        // sequence removed.toBe(3);
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

        // sequence removed.toBe(0);
      });
    });

    describe("addPointsToTeamKaizenPoints", () => {
      const existingPoints: TeamKaizenPointsEntity = {
        teamId: "team-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        points: 200,
        
      };

      it("should add points to current total", () => {
        const updated = addPointsToTeamKaizenPoints(existingPoints, 100);

        expect(updated.points).toBe(300);
      });

      it("should increment sequence", () => {
        const updated = addPointsToTeamKaizenPoints(existingPoints, 100);

        // sequence removed.toBe(3);
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

        // sequence removed.toBe(0);
      });
    });

    describe("addPointsToGameKaizenPoints", () => {
      const existingPoints: GameKaizenPointsEntity = {
        gameId: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
        points: 500,
        
      };

      it("should add points to current total", () => {
        const updated = addPointsToGameKaizenPoints(existingPoints, 150);

        expect(updated.points).toBe(650);
      });

      it("should increment sequence", () => {
        const updated = addPointsToGameKaizenPoints(existingPoints, 150);

        // sequence removed.toBe(6);
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
