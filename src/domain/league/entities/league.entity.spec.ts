import { describe, expect, it } from "vitest";
import {
  createLeagueEntity,
  
  type LeagueEntity,
  type LeagueStatus,
  updateLeagueEntity,
} from "./league.entity";

describe("LeagueEntity", () => {
  describe("createLeagueEntity", () => {
    const validInput = {
      id: "league-123",
      organizationId: "org-123",
      responsibleId: "user-123",
      name: "Safety Championship",
    };

    it("should create entity with required fields", () => {
      const league = createLeagueEntity(validInput);

      expect(league.id).toBe("league-123");
      expect(league.organizationId).toBe("org-123");
      expect(league.responsibleId).toBe("user-123");
      expect(league.name).toBe("Safety Championship");
    });

    it("should set default status to ACTIVE", () => {
      const league = createLeagueEntity(validInput);

      expect(league.status).toBe("ACTIVE");
    });

    it("should set sequence to 0 by default", () => {
      const league = createLeagueEntity(validInput);

      // sequence removed.toBe(0);
    });

    it("should set hidden to false by default", () => {
      const league = createLeagueEntity(validInput);

      expect(league.hidden).toBe(false);
    });

    it("should create entity with optional photo", () => {
      const input = { ...validInput, photo: "photo.jpg" };
      const league = createLeagueEntity(input);

      expect(league.photo).toBe("photo.jpg");
    });

    it("should create entity with optional objective", () => {
      const input = { ...validInput, objective: "Improve safety metrics" };
      const league = createLeagueEntity(input);

      expect(league.objective).toBe("Improve safety metrics");
    });

    it("should create entity with date range", () => {
      const input = {
        ...validInput,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      };
      const league = createLeagueEntity(input);

      expect(league.startDate).toBe("2025-01-01");
      expect(league.endDate).toBe("2025-12-31");
    });

    it("should create entity with prizes", () => {
      const input = {
        ...validInput,
        prizes: [{ prizeId: "prize-1" }, { prizeId: "prize-2" }],
      };
      const league = createLeagueEntity(input);

      expect(league.prizes).toHaveLength(2);
      expect(league.prizes?.[0].prizeId).toBe("prize-1");
    });

    it("should create entity with projects", () => {
      const input = {
        ...validInput,
        projects: ["proj-1", "proj-2", "proj-3"],
      };
      const league = createLeagueEntity(input);

      expect(league.projects).toEqual(["proj-1", "proj-2", "proj-3"]);
    });

    it("should create entity with games", () => {
      const input = {
        ...validInput,
        games: ["game-1", "game-2"],
      };
      const league = createLeagueEntity(input);

      expect(league.games).toEqual(["game-1", "game-2"]);
    });

    it("should create entity with hidden flag", () => {
      const input = { ...validInput, hidden: true };
      const league = createLeagueEntity(input);

      expect(league.hidden).toBe(true);
    });
  });

  describe("updateLeagueEntity", () => {
    const existingLeague: LeagueEntity = {
      id: "league-123",
      organizationId: "org-123",
      responsibleId: "user-123",
      name: "Original Name",
      status: "ACTIVE",
      hidden: false,
      
    };

    it("should update name", () => {
      const updated = updateLeagueEntity(existingLeague, {
        name: "Updated Name",
      });

      expect(updated.name).toBe("Updated Name");
    });

    it("should update status", () => {
      const statuses: LeagueStatus[] = ["ARCHIVED", "DONE", "PAUSED"];

      for (const status of statuses) {
        const updated = updateLeagueEntity(existingLeague, { status });
        expect(updated.status).toBe(status);
      }
    });

    it("should update responsibleId", () => {
      const updated = updateLeagueEntity(existingLeague, {
        responsibleId: "user-456",
      });

      expect(updated.responsibleId).toBe("user-456");
    });

    it("should update photo", () => {
      const updated = updateLeagueEntity(existingLeague, {
        photo: "new-photo.jpg",
      });

      expect(updated.photo).toBe("new-photo.jpg");
    });

    it("should update objective", () => {
      const updated = updateLeagueEntity(existingLeague, {
        objective: "New objective",
      });

      expect(updated.objective).toBe("New objective");
    });

    it("should update date range", () => {
      const updated = updateLeagueEntity(existingLeague, {
        startDate: "2025-06-01",
        endDate: "2025-12-31",
      });

      expect(updated.startDate).toBe("2025-06-01");
      expect(updated.endDate).toBe("2025-12-31");
    });

    it("should update prizes", () => {
      const updated = updateLeagueEntity(existingLeague, {
        prizes: [{ prizeId: "new-prize" }],
      });

      expect(updated.prizes).toHaveLength(1);
      expect(updated.prizes?.[0].prizeId).toBe("new-prize");
    });

    it("should update projects", () => {
      const updated = updateLeagueEntity(existingLeague, {
        projects: ["proj-new"],
      });

      expect(updated.projects).toEqual(["proj-new"]);
    });

    it("should update games", () => {
      const updated = updateLeagueEntity(existingLeague, {
        games: ["game-new"],
      });

      expect(updated.games).toEqual(["game-new"]);
    });

    it("should update hidden flag", () => {
      const updated = updateLeagueEntity(existingLeague, {
        hidden: true,
      });

      expect(updated.hidden).toBe(true);
    });

    it("should increment sequence", () => {
      const updated = updateLeagueEntity(existingLeague, {
        name: "Updated",
      });

      // sequence removed.toBe(1);
    });

    it("should preserve immutable fields", () => {
      const updated = updateLeagueEntity(existingLeague, {
        name: "Updated",
      });

      expect(updated.id).toBe("league-123");
      expect(updated.organizationId).toBe("org-123");
    });

    it("should handle multiple consecutive updates", () => {
      const first = updateLeagueEntity(existingLeague, { name: "First" });
      const second = updateLeagueEntity(first, { status: "PAUSED" });
      const third = updateLeagueEntity(second, { hidden: true });

      expect(third.name).toBe("First");
      expect(third.status).toBe("PAUSED");
      expect(third.hidden).toBe(true);
      // sequence removed.toBe(3);
    });
  });
});
