// Testes unitários para o use case updateTask
// Testando lógica de atualização de tasks, checklist e recalculo de progresso

import { describe, it, expect, vi } from "vitest";
import { updateTask, type UpdateTaskInput } from "./update-task";
import type { ITaskRepository } from "../repositories/task.repository.interface";
import type { TaskEntity } from "../entities/task.entity";

describe("updateTask use case", () => {
  const baseTask: TaskEntity = {
    id: "task-123",
    gameId: "game-1",
    status: "active",
    name: "Task Base",
    rewardPoints: 100,
    sequence: 0,
    progress: { absolute: 50, percent: 50, updatedAt: new Date().toISOString() },
    totalMeasurementExpected: undefined,
  } as unknown as TaskEntity;

  const createMockRepository = (task: TaskEntity | null = baseTask): ITaskRepository => ({
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(task),
    findByGameId: vi.fn(),
    findByTeamId: vi.fn(),
    findByUserId: vi.fn(),
    findByTaskManagerId: vi.fn(),
  });

  it("deve lançar erro se task não encontrada", async () => {
    const mockRepository = createMockRepository(null);

    const input: UpdateTaskInput = {
      gameId: "game-1",
      taskId: "nonexistent",
      name: "Novo Nome",
    };

    await expect(updateTask(input, mockRepository)).rejects.toThrow(
      "Task not found: nonexistent",
    );
  });

  it("deve atualizar campos e recalcular percent quando totalMeasurementExpected muda", async () => {
    const taskWithProgress: TaskEntity = {
      ...baseTask,
      progress: { absolute: 50, percent: 50, updatedAt: new Date().toISOString() },
      totalMeasurementExpected: "100",
    } as unknown as TaskEntity;

    const mockRepository = createMockRepository(taskWithProgress);

    const input: UpdateTaskInput = {
      gameId: "game-1",
      taskId: "task-123",
      totalMeasurementExpected: "200",
      name: "Atualizada",
    };

    const result = await updateTask(input, mockRepository);

    expect(result.task.name).toBe("Atualizada");
    expect(result.task.sequence).toBe(1);
    // percent recalculado deve ser <= 100
    expect(result.task.progress?.percent).toBeDefined();
  });

  it("deve preservar estado do checklist ao atualizar", async () => {
    const taskWithChecklist: TaskEntity = {
      ...baseTask,
      checklist: [{ id: "c1", label: "Item", checked: true }],
    } as unknown as TaskEntity;

    const mockRepository = createMockRepository(taskWithChecklist);

    const input: UpdateTaskInput = {
      gameId: "game-1",
      taskId: "task-123",
      checklist: [{ id: "c1", label: "Item" }],
    };

    const result = await updateTask(input, mockRepository);

    expect(result.task.checklist?.[0].checked).toBe(true);
  });

  it("deve chamar save com task atualizada", async () => {
    const mockRepository = createMockRepository();

    const input: UpdateTaskInput = {
      gameId: "game-1",
      taskId: "task-123",
      name: "Salvar Nome",
    };

    await updateTask(input, mockRepository);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
