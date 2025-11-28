import { describe, it, expect, vi, beforeEach } from "vitest";
import { cancelTaskUpdate } from "./cancel-task-update";
import type { ITaskUpdateRepository } from "../repositories/task-update.repository.interface";
import type { TaskUpdateEntity } from "../entities/task-update.entity";

describe("cancelTaskUpdate use case", () => {
  let mockRepository: ITaskUpdateRepository;

  const createMockTaskUpdate = (
    status: "PENDING_REVIEW" | "APPROVED" | "REJECTED",
  ): TaskUpdateEntity => ({
    id: "update-123",
    gameId: "game-123",
    taskId: "task-123",
    submittedBy: "user-123",
    status,
    progress: {
      absolute: 50,
      percent: 50,
      updatedAt: new Date().toISOString(),
    },
  });

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockImplementation((update) => Promise.resolve(update)),
      findById: vi.fn(),
      findByTaskId: vi.fn(),
      findByGameId: vi.fn(),
    };
  });

  it("should cancel an approved task update", async () => {
    const approvedUpdate = createMockTaskUpdate("APPROVED");
    vi.mocked(mockRepository.findById).mockResolvedValue(approvedUpdate);

    const input = {
      taskId: "task-123",
      taskUpdateId: "update-123",
    };

    const { taskUpdate } = await cancelTaskUpdate(input, mockRepository);

    expect(taskUpdate.status).toBe("PENDING_REVIEW");
    expect(taskUpdate.reviwedBy).toBeUndefined();
    expect(taskUpdate.reviewNote).toBeUndefined();
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("should throw error when task update not found", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const input = {
      taskId: "task-123",
      taskUpdateId: "nonexistent",
    };

    await expect(cancelTaskUpdate(input, mockRepository)).rejects.toThrow(
      "Task update not found",
    );
  });

  it("should throw error when task update is not approved", async () => {
    const pendingUpdate = createMockTaskUpdate("PENDING_REVIEW");
    vi.mocked(mockRepository.findById).mockResolvedValue(pendingUpdate);

    const input = {
      taskId: "task-123",
      taskUpdateId: "update-123",
    };

    await expect(cancelTaskUpdate(input, mockRepository)).rejects.toThrow(
      "Task update must be in APPROVED status to be cancelled",
    );
  });

  it("should throw error when task update is rejected", async () => {
    const rejectedUpdate = createMockTaskUpdate("REJECTED");
    vi.mocked(mockRepository.findById).mockResolvedValue(rejectedUpdate);

    const input = {
      taskId: "task-123",
      taskUpdateId: "update-123",
    };

    await expect(cancelTaskUpdate(input, mockRepository)).rejects.toThrow(
      "Task update must be in APPROVED status to be cancelled",
    );
  });
});
