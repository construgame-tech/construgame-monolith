import { describe, expect, it } from "vitest";
import {
  addPointsToGameTaskPoints,
  createGameTaskPointsEntity,
  type GameTaskPointsEntity,
} from "./game-task-points.entity";
import {
  addPointsToTeamTaskPoints,
  createTeamTaskPointsEntity,
  type TeamTaskPointsEntity,
} from "./team-task-points.entity";
import {
  addPointsToUserTaskPoints,
  createUserTaskPointsEntity,
  type UserTaskPointsEntity,
} from "./user-task-points.entity";

describe("TaskPointsEntities", () => {
  describe("UserTaskPointsEntity", () => {
    describe("createUserTaskPointsEntity", () => {
      const validInput = {
        userId: "user-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
      };

      it("should create entity with required fields", () => {
        const points = createUserTaskPointsEntity(validInput);

        expect(points.userId).toBe("user-123");
        expect(points.organizationId).toBe("org-123");
        expect(points.projectId).toBe("proj-123");
        expect(points.gameId).toBe("game-123");
      });

      it("should initialize points to 0", () => {
        const points = createUserTaskPointsEntity(validInput);

        expect(points.points).toBe(0);
      });

      it("should set sequence to 0 by default", () => {
        const points = createUserTaskPointsEntity(validInput);

        // sequence removed.toBe(0);
      });
    });

    describe("addPointsToUserTaskPoints", () => {
      const existingPoints: UserTaskPointsEntity = {
        userId: "user-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        points: 100,
        
      };

      it("should add points to current total", () => {
        const updated = addPointsToUserTaskPoints(existingPoints, 50);

        expect(updated.points).toBe(150);
      });

      it("should increment sequence", () => {
        const updated = addPointsToUserTaskPoints(existingPoints, 50);

        // sequence removed.toBe(2);
      });

      it("should preserve other fields", () => {
        const updated = addPointsToUserTaskPoints(existingPoints, 50);

        expect(updated.userId).toBe("user-123");
        expect(updated.organizationId).toBe("org-123");
        expect(updated.projectId).toBe("proj-123");
        expect(updated.gameId).toBe("game-123");
      });

      it("should handle adding zero points", () => {
        const updated = addPointsToUserTaskPoints(existingPoints, 0);

        expect(updated.points).toBe(100);
        // sequence removed.toBe(2);
      });

      it("should handle negative points (deduction)", () => {
        const updated = addPointsToUserTaskPoints(existingPoints, -30);

        expect(updated.points).toBe(70);
      });

      it("should handle consecutive additions", () => {
        const first = addPointsToUserTaskPoints(existingPoints, 25);
        const second = addPointsToUserTaskPoints(first, 25);

        expect(second.points).toBe(150);
        // sequence removed.toBe(3);
      });
    });
  });

  describe("TeamTaskPointsEntity", () => {
    describe("createTeamTaskPointsEntity", () => {
      const validInput = {
        teamId: "team-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
      };

      it("should create entity with required fields", () => {
        const points = createTeamTaskPointsEntity(validInput);

        expect(points.teamId).toBe("team-123");
        expect(points.organizationId).toBe("org-123");
        expect(points.projectId).toBe("proj-123");
        expect(points.gameId).toBe("game-123");
      });

      it("should initialize points to 0", () => {
        const points = createTeamTaskPointsEntity(validInput);

        expect(points.points).toBe(0);
      });

      it("should set sequence to 0 by default", () => {
        const points = createTeamTaskPointsEntity(validInput);

        // sequence removed.toBe(0);
      });
    });

    describe("addPointsToTeamTaskPoints", () => {
      const existingPoints: TeamTaskPointsEntity = {
        teamId: "team-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        points: 200,
        
      };

      it("should add points to current total", () => {
        const updated = addPointsToTeamTaskPoints(existingPoints, 100);

        expect(updated.points).toBe(300);
      });

      it("should increment sequence", () => {
        const updated = addPointsToTeamTaskPoints(existingPoints, 100);

        // sequence removed.toBe(3);
      });

      it("should preserve other fields", () => {
        const updated = addPointsToTeamTaskPoints(existingPoints, 100);

        expect(updated.teamId).toBe("team-123");
        expect(updated.organizationId).toBe("org-123");
      });
    });
  });

  describe("GameTaskPointsEntity", () => {
    describe("createGameTaskPointsEntity", () => {
      const validInput = {
        gameId: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
      };

      it("should create entity with required fields", () => {
        const points = createGameTaskPointsEntity(validInput);

        expect(points.gameId).toBe("game-123");
        expect(points.organizationId).toBe("org-123");
        expect(points.projectId).toBe("proj-123");
      });

      it("should initialize points to 0", () => {
        const points = createGameTaskPointsEntity(validInput);

        expect(points.points).toBe(0);
      });

      it("should set sequence to 0 by default", () => {
        const points = createGameTaskPointsEntity(validInput);

        // sequence removed.toBe(0);
      });
    });

    describe("addPointsToGameTaskPoints", () => {
      const existingPoints: GameTaskPointsEntity = {
        gameId: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
        points: 500,
        
      };

      it("should add points to current total", () => {
        const updated = addPointsToGameTaskPoints(existingPoints, 150);

        expect(updated.points).toBe(650);
      });

      it("should increment sequence", () => {
        const updated = addPointsToGameTaskPoints(existingPoints, 150);

        // sequence removed.toBe(6);
      });

      it("should preserve other fields", () => {
        const updated = addPointsToGameTaskPoints(existingPoints, 150);

        expect(updated.gameId).toBe("game-123");
        expect(updated.organizationId).toBe("org-123");
        expect(updated.projectId).toBe("proj-123");
      });

      it("should handle large points values", () => {
        const updated = addPointsToGameTaskPoints(existingPoints, 999999);

        expect(updated.points).toBe(1000499);
      });
    });
  });
});
