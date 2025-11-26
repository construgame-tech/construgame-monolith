// Testes unitários para o use case listGameTasks

import { describe, expect, it, vi } from "vitest";
import type { TaskEntity } from "../entities/task.entity";
import type { ITaskRepository } from "../repositories/task.repository.interface";
import { type ListGameTasksInput, listGameTasks } from "./list-game-tasks";

describe("listGameTasks use case", () => {
  const tasks: TaskEntity[] = [
    {
      id: "t1",
      gameId: "game-1",
      status: "active",
      name: "T1",
      rewardPoints: 10,
      sequence: 0,
    } as TaskEntity,
    {
      id: "t2",
      gameId: "game-1",
      status: "active",
      name: "T2",
      rewardPoints: 20,
      sequence: 0,
    } as TaskEntity,
  ];

  const createMockRepository = (
    tasksList: TaskEntity[] = tasks,
  ): ITaskRepository => ({
    save: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn(),
    findByGameId: vi.fn().mockResolvedValue(tasksList),
    findByTeamId: vi.fn(),
    findByUserId: vi.fn(),
    findByTaskManagerId: vi.fn(),
  });

  it("deve listar tasks de um game", async () => {
    const mockRepository = createMockRepository();

    const input: ListGameTasksInput = { gameId: "game-1" };

    const result = await listGameTasks(input, mockRepository);

    expect(result.tasks).toHaveLength(2);
    expect(result.tasks[0].id).toBe("t1");
    expect(mockRepository.findByGameId).toHaveBeenCalledWith("game-1");
  });

  it("deve retornar array vazio quando não houver tasks", async () => {
    const mockRepository = createMockRepository([]);
    const input: ListGameTasksInput = { gameId: "game-empty" };

    const result = await listGameTasks(input, mockRepository);

    expect(result.tasks).toEqual([]);
  });
});
