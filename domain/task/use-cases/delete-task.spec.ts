// Testes unitários para o use case deleteTask

import { describe, expect, it, vi } from "vitest";
import type { TaskEntity } from "../entities/task.entity";
import type { ITaskRepository } from "../repositories/task.repository.interface";
import { type DeleteTaskInput, deleteTask } from "./delete-task";

describe("deleteTask use case", () => {
  const existingTask: TaskEntity = {
    id: "task-123",
    gameId: "game-1",
    status: "active",
    name: "To Delete",
    rewardPoints: 10,
    sequence: 0,
  } as unknown as TaskEntity;

  const createMockRepository = (
    task: TaskEntity | null = existingTask,
  ): ITaskRepository => ({
    save: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(task),
    findByGameId: vi.fn(),
    findByTeamId: vi.fn(),
    findByUserId: vi.fn(),
    findByTaskManagerId: vi.fn(),
  });

  it("deve retornar sucesso se task inexistente (idempotência)", async () => {
    const mockRepository = createMockRepository(null);

    const input: DeleteTaskInput = { gameId: "game-1", taskId: "nope" };

    const result = await deleteTask(input, mockRepository);

    expect(result.success).toBe(true);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it("deve deletar quando task existe", async () => {
    const mockRepository = createMockRepository();

    const input: DeleteTaskInput = { gameId: "game-1", taskId: "task-123" };

    const result = await deleteTask(input, mockRepository);

    expect(result.success).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith("game-1", "task-123");
    expect(mockRepository.delete).toHaveBeenCalledWith("game-1", "task-123");
  });

  it("deve propagar erro se repository.delete falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "delete").mockRejectedValue(
      new Error("Delete error"),
    );

    const input: DeleteTaskInput = { gameId: "game-1", taskId: "task-123" };

    await expect(deleteTask(input, mockRepository)).rejects.toThrow(
      "Delete error",
    );
  });
});
