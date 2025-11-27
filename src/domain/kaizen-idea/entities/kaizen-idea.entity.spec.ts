import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createKaizenIdeaEntity,
  type KaizenIdeaEntity,
  updateKaizenIdeaEntity,
} from "./kaizen-idea.entity";

describe("KaizenIdeaEntity", () => {
  describe("createKaizenIdeaEntity", () => {
    const validInput = {
      id: "idea-123",
      organizationId: "org-123",
      name: "Improve workflow",
    };

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T10:00:00.000Z"));
    });

    it("should create entity with required fields", () => {
      const idea = createKaizenIdeaEntity(validInput);

      expect(idea.id).toBe("idea-123");
      expect(idea.organizationId).toBe("org-123");
      expect(idea.name).toBe("Improve workflow");
    });

    it("should set default status to DRAFT", () => {
      const idea = createKaizenIdeaEntity(validInput);

      expect(idea.status).toBe("DRAFT");
    });

    it("should set createdDate to current timestamp", () => {
      const idea = createKaizenIdeaEntity(validInput);

      expect(idea.createdDate).toBe("2025-01-15T10:00:00.000Z");
    });

    it("should set sequence to 0 by default", () => {
      const idea = createKaizenIdeaEntity(validInput);

      // sequence removed.toBe(0);
    });

    it("should create entity with optional projectId and gameId", () => {
      const input = {
        ...validInput,
        projectId: "proj-123",
        gameId: "game-123",
      };

      const idea = createKaizenIdeaEntity(input);

      expect(idea.projectId).toBe("proj-123");
      expect(idea.gameId).toBe("game-123");
    });

    it("should create entity with kaizenTypeId", () => {
      const input = {
        ...validInput,
        kaizenTypeId: "type-123",
      };

      const idea = createKaizenIdeaEntity(input);

      expect(idea.kaizenTypeId).toBe("type-123");
    });

    it("should create entity with authors", () => {
      const input = {
        ...validInput,
        authors: {
          players: ["user-1", "user-2"],
          teams: ["team-1"],
        },
      };

      const idea = createKaizenIdeaEntity(input);

      expect(idea.authors?.players).toEqual(["user-1", "user-2"]);
      expect(idea.authors?.teams).toEqual(["team-1"]);
    });

    it("should create entity with problem description and images", () => {
      const input = {
        ...validInput,
        problem: {
          description: "Current process is slow",
          images: ["img1.jpg", "img2.jpg"],
        },
      };

      const idea = createKaizenIdeaEntity(input);

      expect(idea.problem?.description).toBe("Current process is slow");
      expect(idea.problem?.images).toEqual(["img1.jpg", "img2.jpg"]);
    });

    it("should create entity with solution description and images", () => {
      const input = {
        ...validInput,
        solution: {
          description: "Automate the process",
          images: ["solution1.jpg"],
        },
      };

      const idea = createKaizenIdeaEntity(input);

      expect(idea.solution?.description).toBe("Automate the process");
      expect(idea.solution?.images).toEqual(["solution1.jpg"]);
    });

    it("should create entity with tasks", () => {
      const input = {
        ...validInput,
        tasks: [{ name: "Task 1" }, { name: "Task 2" }],
      };

      const idea = createKaizenIdeaEntity(input);

      expect(idea.tasks).toHaveLength(2);
      expect(idea.tasks?.[0].name).toBe("Task 1");
      expect(idea.tasks?.[1].name).toBe("Task 2");
    });

    it("should create entity with benefits", () => {
      const input = {
        ...validInput,
        benefits: [
          { kpiId: "kpi-1", description: "Improve quality" },
          { kpiId: "kpi-2" },
        ],
      };

      const idea = createKaizenIdeaEntity(input);

      expect(idea.benefits).toHaveLength(2);
      expect(idea.benefits?.[0].kpiId).toBe("kpi-1");
      expect(idea.benefits?.[0].description).toBe("Improve quality");
    });

    it("should create entity with attachments", () => {
      const input = {
        ...validInput,
        attachments: [
          {
            name: "doc.pdf",
            size: 1024,
            filetype: "application/pdf",
            createdAt: "2025-01-15T10:00:00.000Z",
            url: "https://example.com/doc.pdf",
          },
        ],
      };

      const idea = createKaizenIdeaEntity(input);

      expect(idea.attachments).toHaveLength(1);
      expect(idea.attachments?.[0].name).toBe("doc.pdf");
    });

    it("should create entity with isRecommended flag", () => {
      const input = {
        ...validInput,
        isRecommended: true,
      };

      const idea = createKaizenIdeaEntity(input);

      expect(idea.isRecommended).toBe(true);
    });

    it("should create entity with executable and non-executable projects", () => {
      const input = {
        ...validInput,
        executableKaizenProjectIds: ["proj-1", "proj-2"],
        nonExecutableProjects: [
          {
            projectId: "proj-3",
            userId: "user-1",
            justification: "Not applicable",
          },
        ],
      };

      const idea = createKaizenIdeaEntity(input);

      expect(idea.executableKaizenProjectIds).toEqual(["proj-1", "proj-2"]);
      expect(idea.nonExecutableProjects).toHaveLength(1);
      expect(idea.nonExecutableProjects?.[0].projectId).toBe("proj-3");
    });
  });

  describe("updateKaizenIdeaEntity", () => {
    const existingIdea: KaizenIdeaEntity = {
      id: "idea-123",
      organizationId: "org-123",
      name: "Original Name",
      status: "DRAFT",
      createdDate: "2025-01-01T10:00:00.000Z",
      
    };

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T10:00:00.000Z"));
    });

    it("should update name", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        name: "Updated Name",
      });

      expect(updated.name).toBe("Updated Name");
    });

    it("should update status", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        status: "APPROVED",
      });

      expect(updated.status).toBe("APPROVED");
    });

    it("should set updatedDate", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        name: "Updated",
      });

      expect(updated.updatedDate).toBe("2025-01-15T10:00:00.000Z");
    });

    it("should increment sequence", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        name: "Updated",
      });

      // sequence removed.toBe(1);
    });

    it("should preserve immutable fields", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        name: "Updated",
      });

      expect(updated.id).toBe("idea-123");
      expect(updated.organizationId).toBe("org-123");
      expect(updated.createdDate).toBe("2025-01-01T10:00:00.000Z");
    });

    it("should update projectId and gameId", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        projectId: "proj-new",
        gameId: "game-new",
      });

      expect(updated.projectId).toBe("proj-new");
      expect(updated.gameId).toBe("game-new");
    });

    it("should update problem and solution", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        problem: { description: "New problem" },
        solution: { description: "New solution" },
      });

      expect(updated.problem?.description).toBe("New problem");
      expect(updated.solution?.description).toBe("New solution");
    });

    it("should update tasks", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        tasks: [{ name: "New Task" }],
      });

      expect(updated.tasks).toHaveLength(1);
      expect(updated.tasks?.[0].name).toBe("New Task");
    });

    it("should update benefits", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        benefits: [{ kpiId: "kpi-new" }],
      });

      expect(updated.benefits).toHaveLength(1);
      expect(updated.benefits?.[0].kpiId).toBe("kpi-new");
    });

    it("should update isRecommended", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        isRecommended: true,
      });

      expect(updated.isRecommended).toBe(true);
    });

    it("should handle multiple consecutive updates", () => {
      const first = updateKaizenIdeaEntity(existingIdea, { name: "First" });
      const second = updateKaizenIdeaEntity(first, { status: "APPROVED" });
      const third = updateKaizenIdeaEntity(second, { isRecommended: true });

      expect(third.name).toBe("First");
      expect(third.status).toBe("APPROVED");
      expect(third.isRecommended).toBe(true);
      // sequence removed.toBe(3);
    });

    it("should update status to ARCHIVED", () => {
      const updated = updateKaizenIdeaEntity(existingIdea, {
        status: "ARCHIVED",
      });

      expect(updated.status).toBe("ARCHIVED");
    });
  });
});
