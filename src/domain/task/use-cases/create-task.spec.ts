// Testes unitários para o use case createTask
// Testando lógica de criação de tasks e integração com repositório mockado

import { describe, expect, it, vi } from "vitest";
import type { ITaskRepository } from "../repositories/task.repository.interface";
import { type CreateTaskInput, createTask } from "./create-task";

describe("createTask use case", () => {
  const createMockRepository = (): ITaskRepository => ({
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn(),
    findByGameId: vi.fn(),
    findByTeamId: vi.fn(),
    findByUserId: vi.fn(),
    findByTaskManagerId: vi.fn(),
  });

  it("deve criar uma task com ID gerado automaticamente e checklist com IDs", async () => {
    const mockRepository = createMockRepository();

    const input: CreateTaskInput = {
      gameId: "game-123",
      name: "Nova Task",
      rewardPoints: 100,
      checklist: [{ label: "Item A" }],
    };

    const result = await createTask(input, mockRepository);

    expect(result.task).toBeDefined();
    expect(result.task.id).toBeDefined();
    expect(result.task.checklist).toHaveLength(1);
    expect(result.task.checklist?.[0].id).toBeDefined();
    expect(result.task.checklist?.[0].label).toBe("Item A");
    expect(result.task.checklist?.[0].checked).toBe(false);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve usar taskId fornecido quando presente", async () => {
    const mockRepository = createMockRepository();

    const input: CreateTaskInput = {
      taskId: "task-abc",
      gameId: "game-123",
      name: "Task com ID",
      rewardPoints: 10,
    };

    const result = await createTask(input, mockRepository);

    expect(result.task.id).toBe("task-abc");
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: "task-abc" }),
    );
  });

  it("deve lançar erro se teamId e userId fornecidos simultaneamente", async () => {
    const mockRepository = createMockRepository();

    const input: CreateTaskInput = {
      gameId: "game-123",
      name: "Task inválida",
      rewardPoints: 10,
      teamId: "team-1",
      userId: "user-1",
    };

    await expect(createTask(input, mockRepository)).rejects.toThrow(
      "Task cannot be assigned to both team and user at the same time",
    );
  });

  it("deve propagar erro se repository.save falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "save").mockRejectedValue(new Error("DB fail"));

    const input: CreateTaskInput = {
      gameId: "game-123",
      name: "Task",
      rewardPoints: 20,
    };

    await expect(createTask(input, mockRepository)).rejects.toThrow("DB fail");
  });
});
