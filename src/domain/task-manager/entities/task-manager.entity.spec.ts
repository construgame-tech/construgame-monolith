import { describe, expect, it } from "vitest";
import {
  createTaskManagerEntity,
  
  type TaskManagerEntity,
  updateTaskManagerEntity,
} from "./task-manager.entity";

describe("TaskManagerEntity", () => {
  describe("createTaskManagerEntity", () => {
    const validInput = {
      id: "tm-123",
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      kpiId: "kpi-123",
      name: "Daily Safety Check",
      rewardPoints: 50,
      responsible: {
        type: "team" as const,
        ids: ["team-1", "team-2"],
      },
      schedule: {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      },
    };

    it("should create entity with required fields", () => {
      const taskManager = createTaskManagerEntity(validInput);

      expect(taskManager.id).toBe("tm-123");
      expect(taskManager.organizationId).toBe("org-123");
      expect(taskManager.projectId).toBe("proj-123");
      expect(taskManager.gameId).toBe("game-123");
      expect(taskManager.kpiId).toBe("kpi-123");
      expect(taskManager.name).toBe("Daily Safety Check");
      expect(taskManager.rewardPoints).toBe(50);
    });

    it("should set default values", () => {
      const taskManager = createTaskManagerEntity(validInput);

      // sequence removed.toBe(0);
      expect(taskManager.progressAbsolute).toBe(0);
      expect(taskManager.tasks).toEqual([]);
    });

    it("should create entity with team responsible", () => {
      const taskManager = createTaskManagerEntity(validInput);

      expect(taskManager.responsible.type).toBe("team");
      expect(taskManager.responsible.ids).toEqual(["team-1", "team-2"]);
    });

    it("should create entity with player responsible", () => {
      const input = {
        ...validInput,
        responsible: {
          type: "player" as const,
          ids: ["user-1", "user-2"],
        },
      };

      const taskManager = createTaskManagerEntity(input);

      expect(taskManager.responsible.type).toBe("player");
      expect(taskManager.responsible.ids).toEqual(["user-1", "user-2"]);
    });

    it("should create entity with schedule", () => {
      const taskManager = createTaskManagerEntity(validInput);

      expect(taskManager.schedule.startDate).toBe("2025-01-01");
      expect(taskManager.schedule.endDate).toBe("2025-12-31");
    });

    it("should create entity with recurrence", () => {
      const input = {
        ...validInput,
        schedule: {
          startDate: "2025-01-01",
          endDate: "2025-12-31",
          recurrence: {
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: false,
            sun: false,
          },
        },
      };

      const taskManager = createTaskManagerEntity(input);

      expect(taskManager.schedule.recurrence?.mon).toBe(true);
      expect(taskManager.schedule.recurrence?.sat).toBe(false);
    });

    it("should create entity with macrostep", () => {
      const input = {
        ...validInput,
        macrostep: {
          macrostepId: "macro-123",
          activityId: "act-123",
        },
      };

      const taskManager = createTaskManagerEntity(input);

      expect(taskManager.macrostep?.macrostepId).toBe("macro-123");
      expect(taskManager.macrostep?.activityId).toBe("act-123");
    });

    it("should create entity with optional description fields", () => {
      const input = {
        ...validInput,
        location: "Site A",
        description: "Perform safety inspection",
        measurementUnit: "inspection",
        totalMeasurementExpected: "30",
      };

      const taskManager = createTaskManagerEntity(input);

      expect(taskManager.location).toBe("Site A");
      expect(taskManager.description).toBe("Perform safety inspection");
      expect(taskManager.measurementUnit).toBe("inspection");
      expect(taskManager.totalMeasurementExpected).toBe("30");
    });

    it("should create entity with video URLs", () => {
      const input = {
        ...validInput,
        videoUrl: "https://youtube.com/watch?v=123",
        embedVideoUrl: "https://youtube.com/embed/123",
      };

      const taskManager = createTaskManagerEntity(input);

      expect(taskManager.videoUrl).toBe("https://youtube.com/watch?v=123");
      expect(taskManager.embedVideoUrl).toBe("https://youtube.com/embed/123");
    });

    it("should create entity with checklist", () => {
      const input = {
        ...validInput,
        checklist: [
          { id: "check-1", label: "Check item 1", checked: false },
          { id: "check-2", label: "Check item 2", checked: true },
        ],
      };

      const taskManager = createTaskManagerEntity(input);

      expect(taskManager.checklist).toHaveLength(2);
      expect(taskManager.checklist?.[0].label).toBe("Check item 1");
      expect(taskManager.checklist?.[1].checked).toBe(true);
    });
  });

  describe("updateTaskManagerEntity", () => {
    const existingTaskManager: TaskManagerEntity = {
      id: "tm-123",
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      kpiId: "kpi-123",
      name: "Original Name",
      rewardPoints: 50,
      responsible: {
        type: "team",
        ids: ["team-1"],
      },
      schedule: {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      },
      progressAbsolute: 0,
      tasks: [],
      
    };

    it("should update name", () => {
      const updated = updateTaskManagerEntity(existingTaskManager, {
        name: "Updated Name",
      });

      expect(updated.name).toBe("Updated Name");
    });

    it("should update rewardPoints", () => {
      const updated = updateTaskManagerEntity(existingTaskManager, {
        rewardPoints: 100,
      });

      expect(updated.rewardPoints).toBe(100);
    });

    it("should update responsible", () => {
      const updated = updateTaskManagerEntity(existingTaskManager, {
        responsible: {
          type: "player",
          ids: ["user-1"],
        },
      });

      expect(updated.responsible.type).toBe("player");
      expect(updated.responsible.ids).toEqual(["user-1"]);
    });

    it("should update schedule", () => {
      const updated = updateTaskManagerEntity(existingTaskManager, {
        schedule: {
          startDate: "2025-06-01",
          endDate: "2025-06-30",
        },
      });

      expect(updated.schedule.startDate).toBe("2025-06-01");
      expect(updated.schedule.endDate).toBe("2025-06-30");
    });

    it("should update progressAbsolute", () => {
      const updated = updateTaskManagerEntity(existingTaskManager, {
        progressAbsolute: 50,
      });

      expect(updated.progressAbsolute).toBe(50);
    });

    it("should update tasks", () => {
      const updated = updateTaskManagerEntity(existingTaskManager, {
        tasks: [
          { id: "task-1", progressAbsolute: 10 },
          { id: "task-2", progressAbsolute: 20 },
        ],
      });

      expect(updated.tasks).toHaveLength(2);
      expect(updated.tasks?.[0].id).toBe("task-1");
    });

    it("should increment sequence", () => {
      const updated = updateTaskManagerEntity(existingTaskManager, {
        name: "Updated",
      });

      // sequence removed.toBe(1);
    });

    it("should preserve immutable fields", () => {
      const updated = updateTaskManagerEntity(existingTaskManager, {
        name: "Updated",
      });

      expect(updated.id).toBe("tm-123");
      expect(updated.organizationId).toBe("org-123");
    });

    it("should handle consecutive updates", () => {
      const first = updateTaskManagerEntity(existingTaskManager, {
        name: "First",
      });
      const second = updateTaskManagerEntity(first, { rewardPoints: 75 });
      const third = updateTaskManagerEntity(second, { progressAbsolute: 25 });

      expect(third.name).toBe("First");
      expect(third.rewardPoints).toBe(75);
      expect(third.progressAbsolute).toBe(25);
      // sequence removed.toBe(3);
    });
  });
});
