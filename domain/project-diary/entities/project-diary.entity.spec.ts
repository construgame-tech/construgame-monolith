import { describe, expect, it } from "vitest";
import {
  createProjectDiaryEntity,
  type ProjectDiaryEntity,
  updateProjectDiaryEntity,
  type Weather,
} from "./project-diary.entity";

describe("ProjectDiaryEntity", () => {
  describe("createProjectDiaryEntity", () => {
    const validInput = {
      organizationId: "org-123",
      projectId: "proj-123",
      date: "2025-01-15",
    };

    it("should create entity with required fields", () => {
      const diary = createProjectDiaryEntity(validInput);

      expect(diary.organizationId).toBe("org-123");
      expect(diary.projectId).toBe("proj-123");
      expect(diary.date).toBe("2025-01-15");
    });

    it("should set sequence to 0 by default", () => {
      const diary = createProjectDiaryEntity(validInput);

      expect(diary.sequence).toBe(0);
    });

    it("should create entity without optional fields by default", () => {
      const diary = createProjectDiaryEntity(validInput);

      expect(diary.notes).toBeUndefined();
      expect(diary.weather).toBeUndefined();
      expect(diary.equipment).toBeUndefined();
      expect(diary.manpower).toBeUndefined();
      expect(diary.indirectManpower).toBeUndefined();
    });

    it("should create entity with notes", () => {
      const input = {
        ...validInput,
        notes: "Productive day with good progress",
      };

      const diary = createProjectDiaryEntity(input);

      expect(diary.notes).toBe("Productive day with good progress");
    });

    it("should create entity with weather for all periods", () => {
      const input = {
        ...validInput,
        weather: {
          morning: "SUNNY" as Weather,
          afternoon: "CLOUDY" as Weather,
          night: "RAINY" as Weather,
        },
      };

      const diary = createProjectDiaryEntity(input);

      expect(diary.weather?.morning).toBe("SUNNY");
      expect(diary.weather?.afternoon).toBe("CLOUDY");
      expect(diary.weather?.night).toBe("RAINY");
    });

    it("should create entity with partial weather", () => {
      const input = {
        ...validInput,
        weather: {
          morning: "SUNNY" as Weather,
        },
      };

      const diary = createProjectDiaryEntity(input);

      expect(diary.weather?.morning).toBe("SUNNY");
      expect(diary.weather?.afternoon).toBeUndefined();
      expect(diary.weather?.night).toBeUndefined();
    });

    it("should create entity with equipment", () => {
      const input = {
        ...validInput,
        equipment: [
          { name: "Excavator", quantity: 2 },
          { name: "Crane", quantity: 1 },
        ],
      };

      const diary = createProjectDiaryEntity(input);

      expect(diary.equipment).toHaveLength(2);
      expect(diary.equipment?.[0].name).toBe("Excavator");
      expect(diary.equipment?.[0].quantity).toBe(2);
    });

    it("should create entity with manpower", () => {
      const input = {
        ...validInput,
        manpower: [
          { name: "Engineer", quantity: 3 },
          { name: "Operator", quantity: 5 },
        ],
      };

      const diary = createProjectDiaryEntity(input);

      expect(diary.manpower).toHaveLength(2);
      expect(diary.manpower?.[0].name).toBe("Engineer");
      expect(diary.manpower?.[0].quantity).toBe(3);
    });

    it("should create entity with indirect manpower", () => {
      const input = {
        ...validInput,
        indirectManpower: [
          { name: "Supervisor", quantity: 1 },
          { name: "Admin", quantity: 2 },
        ],
      };

      const diary = createProjectDiaryEntity(input);

      expect(diary.indirectManpower).toHaveLength(2);
      expect(diary.indirectManpower?.[0].name).toBe("Supervisor");
    });

    it("should create entity with all optional fields", () => {
      const input = {
        ...validInput,
        notes: "Full diary entry",
        weather: { morning: "SUNNY" as Weather },
        equipment: [{ name: "Truck", quantity: 3 }],
        manpower: [{ name: "Worker", quantity: 10 }],
        indirectManpower: [{ name: "Manager", quantity: 1 }],
      };

      const diary = createProjectDiaryEntity(input);

      expect(diary.notes).toBe("Full diary entry");
      expect(diary.weather?.morning).toBe("SUNNY");
      expect(diary.equipment).toHaveLength(1);
      expect(diary.manpower).toHaveLength(1);
      expect(diary.indirectManpower).toHaveLength(1);
    });
  });

  describe("updateProjectDiaryEntity", () => {
    const existingDiary: ProjectDiaryEntity = {
      organizationId: "org-123",
      projectId: "proj-123",
      date: "2025-01-15",
      sequence: 0,
    };

    it("should update notes", () => {
      const updated = updateProjectDiaryEntity(existingDiary, {
        notes: "Updated notes",
      });

      expect(updated.notes).toBe("Updated notes");
    });

    it("should update weather", () => {
      const updated = updateProjectDiaryEntity(existingDiary, {
        weather: { morning: "RAINY", afternoon: "CLOUDY" },
      });

      expect(updated.weather?.morning).toBe("RAINY");
      expect(updated.weather?.afternoon).toBe("CLOUDY");
    });

    it("should update equipment", () => {
      const updated = updateProjectDiaryEntity(existingDiary, {
        equipment: [{ name: "Bulldozer", quantity: 1 }],
      });

      expect(updated.equipment).toHaveLength(1);
      expect(updated.equipment?.[0].name).toBe("Bulldozer");
    });

    it("should update manpower", () => {
      const updated = updateProjectDiaryEntity(existingDiary, {
        manpower: [{ name: "Technician", quantity: 4 }],
      });

      expect(updated.manpower).toHaveLength(1);
      expect(updated.manpower?.[0].quantity).toBe(4);
    });

    it("should update indirect manpower", () => {
      const updated = updateProjectDiaryEntity(existingDiary, {
        indirectManpower: [{ name: "Safety Officer", quantity: 1 }],
      });

      expect(updated.indirectManpower).toHaveLength(1);
    });

    it("should increment sequence", () => {
      const updated = updateProjectDiaryEntity(existingDiary, {
        notes: "New notes",
      });

      expect(updated.sequence).toBe(1);
    });

    it("should preserve immutable fields", () => {
      const updated = updateProjectDiaryEntity(existingDiary, {
        notes: "Updated",
      });

      expect(updated.organizationId).toBe("org-123");
      expect(updated.projectId).toBe("proj-123");
      expect(updated.date).toBe("2025-01-15");
    });

    it("should preserve unchanged optional fields", () => {
      const diaryWithData: ProjectDiaryEntity = {
        ...existingDiary,
        notes: "Original notes",
        weather: { morning: "SUNNY" },
      };

      const updated = updateProjectDiaryEntity(diaryWithData, {
        equipment: [{ name: "Crane", quantity: 1 }],
      });

      expect(updated.notes).toBe("Original notes");
      expect(updated.weather?.morning).toBe("SUNNY");
    });

    it("should handle consecutive updates", () => {
      const first = updateProjectDiaryEntity(existingDiary, { notes: "First" });
      const second = updateProjectDiaryEntity(first, {
        weather: { morning: "SUNNY" },
      });

      expect(second.notes).toBe("First");
      expect(second.weather?.morning).toBe("SUNNY");
      expect(second.sequence).toBe(2);
    });
  });
});
