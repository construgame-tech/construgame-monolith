import { describe, it, expect } from "vitest";
import {
  createUserGamePointsEntity,
  createTeamGamePointsEntity,
  updateUserGamePoints,
  updateTeamGamePoints,
  type UserGamePointsEntity,
  type TeamGamePointsEntity,
} from "./game-points.entity";

describe("GamePointsEntity", () => {
  describe("createUserGamePointsEntity", () => {
    const validInput = {
      userId: "user-123",
      gameId: "game-123",
      organizationId: "org-123",
      projectId: "proj-123",
    };

    it("should create entity with required fields", () => {
      const points = createUserGamePointsEntity(validInput);

      expect(points.userId).toBe("user-123");
      expect(points.gameId).toBe("game-123");
      expect(points.organizationId).toBe("org-123");
      expect(points.projectId).toBe("proj-123");
    });

    it("should initialize all points to 0", () => {
      const points = createUserGamePointsEntity(validInput);

      expect(points.taskPoints).toBe(0);
      expect(points.kaizenPoints).toBe(0);
      expect(points.totalPoints).toBe(0);
    });

    it("should set sequence to 0 by default", () => {
      const points = createUserGamePointsEntity(validInput);

      expect(points.sequence).toBe(0);
    });
  });

  describe("createTeamGamePointsEntity", () => {
    const validInput = {
      teamId: "team-123",
      gameId: "game-123",
      organizationId: "org-123",
      projectId: "proj-123",
    };

    it("should create entity with required fields", () => {
      const points = createTeamGamePointsEntity(validInput);

      expect(points.teamId).toBe("team-123");
      expect(points.gameId).toBe("game-123");
      expect(points.organizationId).toBe("org-123");
      expect(points.projectId).toBe("proj-123");
    });

    it("should initialize all points to 0", () => {
      const points = createTeamGamePointsEntity(validInput);

      expect(points.taskPoints).toBe(0);
      expect(points.kaizenPoints).toBe(0);
      expect(points.totalPoints).toBe(0);
    });

    it("should set sequence to 0 by default", () => {
      const points = createTeamGamePointsEntity(validInput);

      expect(points.sequence).toBe(0);
    });
  });

  describe("updateUserGamePoints", () => {
    const existingPoints: UserGamePointsEntity = {
      userId: "user-123",
      gameId: "game-123",
      organizationId: "org-123",
      projectId: "proj-123",
      taskPoints: 0,
      kaizenPoints: 0,
      totalPoints: 0,
      sequence: 0,
    };

    it("should update task and kaizen points", () => {
      const updated = updateUserGamePoints(existingPoints, 100, 50);

      expect(updated.taskPoints).toBe(100);
      expect(updated.kaizenPoints).toBe(50);
    });

    it("should calculate total points correctly", () => {
      const updated = updateUserGamePoints(existingPoints, 100, 50);

      expect(updated.totalPoints).toBe(150);
    });

    it("should increment sequence", () => {
      const updated = updateUserGamePoints(existingPoints, 100, 50);

      expect(updated.sequence).toBe(1);
    });

    it("should preserve other fields", () => {
      const updated = updateUserGamePoints(existingPoints, 100, 50);

      expect(updated.userId).toBe("user-123");
      expect(updated.gameId).toBe("game-123");
      expect(updated.organizationId).toBe("org-123");
      expect(updated.projectId).toBe("proj-123");
    });

    it("should handle zero points update", () => {
      const pointsWithValues: UserGamePointsEntity = {
        ...existingPoints,
        taskPoints: 100,
        kaizenPoints: 50,
        totalPoints: 150,
        sequence: 1,
      };

      const updated = updateUserGamePoints(pointsWithValues, 0, 0);

      expect(updated.taskPoints).toBe(0);
      expect(updated.kaizenPoints).toBe(0);
      expect(updated.totalPoints).toBe(0);
      expect(updated.sequence).toBe(2);
    });

    it("should handle large points values", () => {
      const updated = updateUserGamePoints(existingPoints, 999999, 888888);

      expect(updated.taskPoints).toBe(999999);
      expect(updated.kaizenPoints).toBe(888888);
      expect(updated.totalPoints).toBe(1888887);
    });
  });

  describe("updateTeamGamePoints", () => {
    const existingPoints: TeamGamePointsEntity = {
      teamId: "team-123",
      gameId: "game-123",
      organizationId: "org-123",
      projectId: "proj-123",
      taskPoints: 0,
      kaizenPoints: 0,
      totalPoints: 0,
      sequence: 0,
    };

    it("should update task and kaizen points", () => {
      const updated = updateTeamGamePoints(existingPoints, 200, 100);

      expect(updated.taskPoints).toBe(200);
      expect(updated.kaizenPoints).toBe(100);
    });

    it("should calculate total points correctly", () => {
      const updated = updateTeamGamePoints(existingPoints, 200, 100);

      expect(updated.totalPoints).toBe(300);
    });

    it("should increment sequence", () => {
      const updated = updateTeamGamePoints(existingPoints, 200, 100);

      expect(updated.sequence).toBe(1);
    });

    it("should preserve other fields", () => {
      const updated = updateTeamGamePoints(existingPoints, 200, 100);

      expect(updated.teamId).toBe("team-123");
      expect(updated.gameId).toBe("game-123");
      expect(updated.organizationId).toBe("org-123");
      expect(updated.projectId).toBe("proj-123");
    });

    it("should handle consecutive updates", () => {
      const first = updateTeamGamePoints(existingPoints, 100, 50);
      const second = updateTeamGamePoints(first, 200, 100);

      expect(second.taskPoints).toBe(200);
      expect(second.kaizenPoints).toBe(100);
      expect(second.totalPoints).toBe(300);
      expect(second.sequence).toBe(2);
    });
  });
});
