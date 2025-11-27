// Testes unitários para o use case getTask

import { describe, expect, it, vi } from "vitest";
import type { TaskEntity } from "../entities/task.entity";
import type { ITaskRepository } from "../repositories/task.repository.interface";
import { type GetTaskInput, getTask } from "./get-task";

describe("getTask use case", () => {
  const existingTask: TaskEntity = {
    id: "task-123",
    gameId: "game-1",
    status: "active",
    name: "Task",
    rewardPoints: 10,
    
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

  it("deve retornar task quando encontrada", async () => {
    const mockRepository = createMockRepository();

    const input: GetTaskInput = { gameId: "game-1", taskId: "task-123" };

    const result = await getTask(input, mockRepository);

    expect(result.task).toBeDefined();
    expect(result.task.id).toBe("task-123");
  });

  it("deve lançar erro quando não encontrada", async () => {
    const mockRepository = createMockRepository(null);

    const input: GetTaskInput = { gameId: "game-1", taskId: "nope" };

    await expect(getTask(input, mockRepository)).rejects.toThrow(
      "Task not found: nope",
    );
  });
});
