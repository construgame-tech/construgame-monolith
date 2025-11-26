import { describe, expect, it } from "vitest";
import {
  approveTaskUpdateEntity,
  cancelTaskUpdateEntity,
  createTaskUpdateEntity,
  rejectTaskUpdateEntity,
  type TaskUpdateEntity,
  validateCanApprove,
  validateCanCancel,
  validateCanReject,
} from "./task-update.entity";

describe("TaskUpdateEntity", () => {
  describe("createTaskUpdateEntity", () => {
    const validInput = {
      id: "update-123",
      gameId: "game-123",
      taskId: "task-123",
      submittedBy: "user-123",
      progress: {
        absolute: 10,
        updatedAt: "2025-01-15T10:00:00.000Z",
      },
    };

    it("should create entity with required fields", () => {
      const update = createTaskUpdateEntity(validInput);

      expect(update.id).toBe("update-123");
      expect(update.gameId).toBe("game-123");
      expect(update.taskId).toBe("task-123");
      expect(update.submittedBy).toBe("user-123");
    });

    it("should set default status to PENDING_REVIEW", () => {
      const update = createTaskUpdateEntity(validInput);

      expect(update.status).toBe("PENDING_REVIEW");
    });

    it("should set sequence to 0 by default", () => {
      const update = createTaskUpdateEntity(validInput);

      expect(update.sequence).toBe(0);
    });

    it("should create entity with progress data", () => {
      const update = createTaskUpdateEntity(validInput);

      expect(update.progress.absolute).toBe(10);
      expect(update.progress.updatedAt).toBe("2025-01-15T10:00:00.000Z");
    });

    it("should create entity with percent progress", () => {
      const input = {
        ...validInput,
        progress: {
          percent: 50,
          updatedAt: "2025-01-15T10:00:00.000Z",
        },
      };

      const update = createTaskUpdateEntity(input);

      expect(update.progress.percent).toBe(50);
    });

    it("should create entity with hours and note", () => {
      const input = {
        ...validInput,
        progress: {
          hours: 8,
          note: "Completed morning shift",
          updatedAt: "2025-01-15T10:00:00.000Z",
        },
      };

      const update = createTaskUpdateEntity(input);

      expect(update.progress.hours).toBe(8);
      expect(update.progress.note).toBe("Completed morning shift");
    });

    it("should create entity with participants", () => {
      const input = {
        ...validInput,
        participants: ["user-1", "user-2", "user-3"],
      };

      const update = createTaskUpdateEntity(input);

      expect(update.participants).toEqual(["user-1", "user-2", "user-3"]);
    });

    it("should create entity with photos", () => {
      const input = {
        ...validInput,
        photos: ["photo1.jpg", "photo2.jpg"],
      };

      const update = createTaskUpdateEntity(input);

      expect(update.photos).toEqual(["photo1.jpg", "photo2.jpg"]);
    });

    it("should create entity with date range", () => {
      const input = {
        ...validInput,
        startDate: new Date("2025-01-15T08:00:00.000Z"),
        endDate: new Date("2025-01-15T17:00:00.000Z"),
      };

      const update = createTaskUpdateEntity(input);

      expect(update.startDate).toEqual(new Date("2025-01-15T08:00:00.000Z"));
      expect(update.endDate).toEqual(new Date("2025-01-15T17:00:00.000Z"));
    });

    it("should create entity with checklist", () => {
      const input = {
        ...validInput,
        checklist: [
          { id: "check-1", checked: true },
          { id: "check-2", checked: false },
        ],
      };

      const update = createTaskUpdateEntity(input);

      expect(update.checklist).toHaveLength(2);
      expect(update.checklist?.[0].checked).toBe(true);
      expect(update.checklist?.[1].checked).toBe(false);
    });

    it("should create entity with files", () => {
      const input = {
        ...validInput,
        files: [
          {
            name: "report.pdf",
            size: 1024,
            url: "https://example.com/report.pdf",
            filetype: "application/pdf",
          },
        ],
      };

      const update = createTaskUpdateEntity(input);

      expect(update.files).toHaveLength(1);
      expect(update.files?.[0].name).toBe("report.pdf");
    });
  });

  describe("approveTaskUpdateEntity", () => {
    const pendingUpdate: TaskUpdateEntity = {
      id: "update-123",
      gameId: "game-123",
      taskId: "task-123",
      status: "PENDING_REVIEW",
      submittedBy: "user-123",
      progress: { absolute: 10, updatedAt: "2025-01-15T10:00:00.000Z" },
      sequence: 0,
    };

    it("should change status to APPROVED", () => {
      const approved = approveTaskUpdateEntity(pendingUpdate);

      expect(approved.status).toBe("APPROVED");
    });

    it("should increment sequence", () => {
      const approved = approveTaskUpdateEntity(pendingUpdate);

      expect(approved.sequence).toBe(1);
    });

    it("should set reviewer info", () => {
      const approved = approveTaskUpdateEntity(pendingUpdate, {
        reviwedBy: "reviewer-123",
        reviewNote: "Looks good",
      });

      expect(approved.reviwedBy).toBe("reviewer-123");
      expect(approved.reviewNote).toBe("Looks good");
    });

    it("should update progress absolute", () => {
      const approved = approveTaskUpdateEntity(pendingUpdate, {
        progressAbsolute: 20,
      });

      expect(approved.progress.absolute).toBe(20);
    });

    it("should update participants", () => {
      const approved = approveTaskUpdateEntity(pendingUpdate, {
        participants: ["user-1", "user-2"],
      });

      expect(approved.participants).toEqual(["user-1", "user-2"]);
    });

    it("should update checklist", () => {
      const approved = approveTaskUpdateEntity(pendingUpdate, {
        checklist: [{ id: "check-1", checked: true }],
      });

      expect(approved.checklist).toHaveLength(1);
    });

    it("should update date range", () => {
      const startDate = new Date("2025-01-15T08:00:00.000Z");
      const endDate = new Date("2025-01-15T17:00:00.000Z");

      const approved = approveTaskUpdateEntity(pendingUpdate, {
        startDate,
        endDate,
      });

      expect(approved.startDate).toEqual(startDate);
      expect(approved.endDate).toEqual(endDate);
    });
  });

  describe("rejectTaskUpdateEntity", () => {
    const pendingUpdate: TaskUpdateEntity = {
      id: "update-123",
      gameId: "game-123",
      taskId: "task-123",
      status: "PENDING_REVIEW",
      submittedBy: "user-123",
      progress: { absolute: 10, updatedAt: "2025-01-15T10:00:00.000Z" },
      sequence: 0,
    };

    it("should change status to REJECTED", () => {
      const rejected = rejectTaskUpdateEntity(pendingUpdate, {
        reviwedBy: "reviewer-123",
      });

      expect(rejected.status).toBe("REJECTED");
    });

    it("should set reviewer id", () => {
      const rejected = rejectTaskUpdateEntity(pendingUpdate, {
        reviwedBy: "reviewer-123",
      });

      expect(rejected.reviwedBy).toBe("reviewer-123");
    });

    it("should set review note", () => {
      const rejected = rejectTaskUpdateEntity(pendingUpdate, {
        reviwedBy: "reviewer-123",
        reviewNote: "Insufficient evidence",
      });

      expect(rejected.reviewNote).toBe("Insufficient evidence");
    });

    it("should increment sequence", () => {
      const rejected = rejectTaskUpdateEntity(pendingUpdate, {
        reviwedBy: "reviewer-123",
      });

      expect(rejected.sequence).toBe(1);
    });
  });

  describe("cancelTaskUpdateEntity", () => {
    const approvedUpdate: TaskUpdateEntity = {
      id: "update-123",
      gameId: "game-123",
      taskId: "task-123",
      status: "APPROVED",
      submittedBy: "user-123",
      reviwedBy: "reviewer-123",
      reviewNote: "Approved",
      progress: { absolute: 10, updatedAt: "2025-01-15T10:00:00.000Z" },
      sequence: 1,
    };

    it("should change status to PENDING_REVIEW", () => {
      const cancelled = cancelTaskUpdateEntity(approvedUpdate);

      expect(cancelled.status).toBe("PENDING_REVIEW");
    });

    it("should clear reviewer info", () => {
      const cancelled = cancelTaskUpdateEntity(approvedUpdate);

      expect(cancelled.reviwedBy).toBeUndefined();
      expect(cancelled.reviewNote).toBeUndefined();
    });

    it("should increment sequence", () => {
      const cancelled = cancelTaskUpdateEntity(approvedUpdate);

      expect(cancelled.sequence).toBe(2);
    });
  });

  describe("validateCanApprove", () => {
    it("should not throw for PENDING_REVIEW status", () => {
      const update: TaskUpdateEntity = {
        id: "update-123",
        gameId: "game-123",
        taskId: "task-123",
        status: "PENDING_REVIEW",
        submittedBy: "user-123",
        progress: { updatedAt: "2025-01-15T10:00:00.000Z" },
        sequence: 0,
      };

      expect(() => validateCanApprove(update)).not.toThrow();
    });

    it("should throw for APPROVED status", () => {
      const update: TaskUpdateEntity = {
        id: "update-123",
        gameId: "game-123",
        taskId: "task-123",
        status: "APPROVED",
        submittedBy: "user-123",
        progress: { updatedAt: "2025-01-15T10:00:00.000Z" },
        sequence: 0,
      };

      expect(() => validateCanApprove(update)).toThrow(
        "Task update must be in PENDING_REVIEW status to be approved",
      );
    });

    it("should throw for REJECTED status", () => {
      const update: TaskUpdateEntity = {
        id: "update-123",
        gameId: "game-123",
        taskId: "task-123",
        status: "REJECTED",
        submittedBy: "user-123",
        progress: { updatedAt: "2025-01-15T10:00:00.000Z" },
        sequence: 0,
      };

      expect(() => validateCanApprove(update)).toThrow(
        "Task update must be in PENDING_REVIEW status to be approved",
      );
    });
  });

  describe("validateCanReject", () => {
    it("should not throw for PENDING_REVIEW status", () => {
      const update: TaskUpdateEntity = {
        id: "update-123",
        gameId: "game-123",
        taskId: "task-123",
        status: "PENDING_REVIEW",
        submittedBy: "user-123",
        progress: { updatedAt: "2025-01-15T10:00:00.000Z" },
        sequence: 0,
      };

      expect(() => validateCanReject(update)).not.toThrow();
    });

    it("should throw for APPROVED status", () => {
      const update: TaskUpdateEntity = {
        id: "update-123",
        gameId: "game-123",
        taskId: "task-123",
        status: "APPROVED",
        submittedBy: "user-123",
        progress: { updatedAt: "2025-01-15T10:00:00.000Z" },
        sequence: 0,
      };

      expect(() => validateCanReject(update)).toThrow(
        "Task update must be in PENDING_REVIEW status to be rejected",
      );
    });
  });

  describe("validateCanCancel", () => {
    it("should not throw for APPROVED status", () => {
      const update: TaskUpdateEntity = {
        id: "update-123",
        gameId: "game-123",
        taskId: "task-123",
        status: "APPROVED",
        submittedBy: "user-123",
        progress: { updatedAt: "2025-01-15T10:00:00.000Z" },
        sequence: 0,
      };

      expect(() => validateCanCancel(update)).not.toThrow();
    });

    it("should throw for PENDING_REVIEW status", () => {
      const update: TaskUpdateEntity = {
        id: "update-123",
        gameId: "game-123",
        taskId: "task-123",
        status: "PENDING_REVIEW",
        submittedBy: "user-123",
        progress: { updatedAt: "2025-01-15T10:00:00.000Z" },
        sequence: 0,
      };

      expect(() => validateCanCancel(update)).toThrow(
        "Task update must be in APPROVED status to be cancelled",
      );
    });

    it("should throw for REJECTED status", () => {
      const update: TaskUpdateEntity = {
        id: "update-123",
        gameId: "game-123",
        taskId: "task-123",
        status: "REJECTED",
        submittedBy: "user-123",
        progress: { updatedAt: "2025-01-15T10:00:00.000Z" },
        sequence: 0,
      };

      expect(() => validateCanCancel(update)).toThrow(
        "Task update must be in APPROVED status to be cancelled",
      );
    });
  });
});
