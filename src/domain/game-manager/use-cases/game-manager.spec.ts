// Testes para os use-cases de Game Manager
import { describe, it, expect, vi, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";

import type { IGameManagerRepository } from "../repositories/game-manager.repository.interface";
import type { IGameManagerTaskRepository } from "../repositories/game-manager-task.repository.interface";
import type { GameManagerEntity } from "../entities/game-manager.entity";
import type { GameManagerTaskEntity } from "../entities/game-manager-task.entity";

import { createGameManager } from "./create-game-manager";
import { updateGameManager, GameManagerNotFoundError } from "./update-game-manager";
import { getGameManager } from "./get-game-manager";
import { listGameManagers } from "./list-game-managers";
import { deleteGameManager } from "./delete-game-manager";
import { createGameManagerTask } from "./create-game-manager-task";
import { updateGameManagerTask, GameManagerTaskNotFoundError } from "./update-game-manager-task";
import { listGameManagerTasks } from "./list-game-manager-tasks";
import { deleteGameManagerTask } from "./delete-game-manager-task";

const createMockGameManagerRepository = (): IGameManagerRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  findById: vi.fn().mockResolvedValue(null),
  findByOrganizationId: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockResolvedValue(undefined),
});

const createMockGameManagerTaskRepository = (): IGameManagerTaskRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  findById: vi.fn().mockResolvedValue(null),
  findByGameManagerId: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockResolvedValue(undefined),
  deleteByGameManagerId: vi.fn().mockResolvedValue(undefined),
});

describe("createGameManager", () => {
  let mockRepository: IGameManagerRepository;

  beforeEach(() => {
    mockRepository = createMockGameManagerRepository();
  });

  it("deve criar um game manager com todos os campos", async () => {
    const input = {
      organizationId: randomUUID(),
      projectId: randomUUID(),
      name: "Game Manager Test",
    };

    const result = await createGameManager(input, mockRepository);

    expect(result.gameManager).toBeDefined();
    expect(result.gameManager.id).toBeDefined();
    expect(result.gameManager.name).toBe("Game Manager Test");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});

describe("updateGameManager", () => {
  let mockRepository: IGameManagerRepository;

  beforeEach(() => {
    mockRepository = createMockGameManagerRepository();
  });

  it("deve atualizar um game manager existente", async () => {
    const existingGameManager: GameManagerEntity = {
      id: randomUUID(),
      organizationId: randomUUID(),
      projectId: randomUUID(),
      name: "Original Name",
    };

    vi.spyOn(mockRepository, "findById").mockResolvedValue(existingGameManager);

    const result = await updateGameManager(
      { id: existingGameManager.id, name: "Updated Name" },
      mockRepository,
    );

    expect(result.gameManager.name).toBe("Updated Name");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve lancar erro se game manager nao existir", async () => {
    vi.spyOn(mockRepository, "findById").mockResolvedValue(null);

    await expect(
      updateGameManager({ id: randomUUID(), name: "Test" }, mockRepository),
    ).rejects.toThrow(GameManagerNotFoundError);
  });
});

describe("getGameManager", () => {
  let mockRepository: IGameManagerRepository;

  beforeEach(() => {
    mockRepository = createMockGameManagerRepository();
  });

  it("deve retornar game manager quando encontrado", async () => {
    const existingGameManager: GameManagerEntity = {
      id: randomUUID(),
      organizationId: randomUUID(),
      projectId: randomUUID(),
      name: "Test Game Manager",
    };

    vi.spyOn(mockRepository, "findById").mockResolvedValue(existingGameManager);

    const result = await getGameManager({ id: existingGameManager.id }, mockRepository);

    expect(result.gameManager).toBeDefined();
    expect(result.gameManager?.name).toBe("Test Game Manager");
  });

  it("deve retornar null quando nao encontrado", async () => {
    vi.spyOn(mockRepository, "findById").mockResolvedValue(null);

    const result = await getGameManager({ id: randomUUID() }, mockRepository);

    expect(result.gameManager).toBeNull();
  });
});

describe("listGameManagers", () => {
  let mockRepository: IGameManagerRepository;

  beforeEach(() => {
    mockRepository = createMockGameManagerRepository();
  });

  it("deve listar game managers de uma organizacao", async () => {
    const organizationId = randomUUID();
    const gameManagers: GameManagerEntity[] = [
      { id: randomUUID(), organizationId, projectId: randomUUID(), name: "GM 1" },
      { id: randomUUID(), organizationId, projectId: randomUUID(), name: "GM 2" },
    ];

    vi.spyOn(mockRepository, "findByOrganizationId").mockResolvedValue(gameManagers);

    const result = await listGameManagers({ organizationId }, mockRepository);

    expect(result.gameManagers).toHaveLength(2);
  });
});

describe("deleteGameManager", () => {
  let mockGameManagerRepository: IGameManagerRepository;
  let mockTaskRepository: IGameManagerTaskRepository;

  beforeEach(() => {
    mockGameManagerRepository = createMockGameManagerRepository();
    mockTaskRepository = createMockGameManagerTaskRepository();
  });

  it("deve deletar game manager e suas tasks associadas", async () => {
    const gameManagerId = randomUUID();

    await deleteGameManager(
      { id: gameManagerId },
      mockGameManagerRepository,
      mockTaskRepository,
    );

    expect(mockTaskRepository.deleteByGameManagerId).toHaveBeenCalledWith(gameManagerId);
    expect(mockGameManagerRepository.delete).toHaveBeenCalledWith(gameManagerId);
  });
});

describe("createGameManagerTask", () => {
  let mockRepository: IGameManagerTaskRepository;

  beforeEach(() => {
    mockRepository = createMockGameManagerTaskRepository();
  });

  it("deve criar uma task", async () => {
    const input = {
      gameManagerId: randomUUID(),
      organizationId: randomUUID(),
      projectId: randomUUID(),
      name: "Task Test",
    };

    const result = await createGameManagerTask(input, mockRepository);

    expect(result.task).toBeDefined();
    expect(result.task.name).toBe("Task Test");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});

describe("updateGameManagerTask", () => {
  let mockRepository: IGameManagerTaskRepository;

  beforeEach(() => {
    mockRepository = createMockGameManagerTaskRepository();
  });

  it("deve atualizar uma task existente", async () => {
    const existingTask: GameManagerTaskEntity = {
      id: randomUUID(),
      gameManagerId: randomUUID(),
      organizationId: randomUUID(),
      projectId: randomUUID(),
      name: "Original Task",
    };

    vi.spyOn(mockRepository, "findById").mockResolvedValue(existingTask);

    const result = await updateGameManagerTask(
      { id: existingTask.id, name: "Updated Task" },
      mockRepository,
    );

    expect(result.task.name).toBe("Updated Task");
  });

  it("deve lancar erro se task nao existir", async () => {
    vi.spyOn(mockRepository, "findById").mockResolvedValue(null);

    await expect(
      updateGameManagerTask({ id: randomUUID(), name: "Test" }, mockRepository),
    ).rejects.toThrow(GameManagerTaskNotFoundError);
  });
});

describe("listGameManagerTasks", () => {
  let mockRepository: IGameManagerTaskRepository;

  beforeEach(() => {
    mockRepository = createMockGameManagerTaskRepository();
  });

  it("deve listar tasks de um game manager", async () => {
    const gameManagerId = randomUUID();
    const tasks: GameManagerTaskEntity[] = [
      { id: randomUUID(), gameManagerId, organizationId: randomUUID(), projectId: randomUUID(), name: "Task 1" },
    ];

    vi.spyOn(mockRepository, "findByGameManagerId").mockResolvedValue(tasks);

    const result = await listGameManagerTasks({ gameManagerId }, mockRepository);

    expect(result.tasks).toHaveLength(1);
  });
});

describe("deleteGameManagerTask", () => {
  let mockRepository: IGameManagerTaskRepository;

  beforeEach(() => {
    mockRepository = createMockGameManagerTaskRepository();
  });

  it("deve deletar uma task", async () => {
    const taskId = randomUUID();

    await deleteGameManagerTask({ id: taskId }, mockRepository);

    expect(mockRepository.delete).toHaveBeenCalledWith(taskId);
  });
});
