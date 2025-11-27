// Testes unitários para o use case listProjectGames
// Testando lógica de listagem de games por projeto

import { describe, expect, it, vi } from "vitest";
import type { GameEntity } from "../entities/game.entity";
import type { IGameRepository } from "../repositories/game.repository.interface";
import {
  type ListProjectGamesInput,
  listProjectGames,
} from "./list-project-games";

describe("listProjectGames use case", () => {
  const mockGames: GameEntity[] = [
    {
      id: "game-1",
      organizationId: "org-123",
      projectId: "proj-123",
      name: "Game do Projeto 1",
      status: "ACTIVE",
      
      archived: false,
    },
    {
      id: "game-2",
      organizationId: "org-123",
      projectId: "proj-123",
      name: "Game do Projeto 2",
      status: "PAUSED",
      
      archived: false,
    },
  ];

  const createMockRepository = (
    games: GameEntity[] = mockGames,
  ): IGameRepository => ({
    save: vi.fn(),
    findById: vi.fn(),
    findByOrganizationId: vi.fn(),
    findByProjectId: vi.fn().mockResolvedValue(games),
    delete: vi.fn(),
  });

  it("deve listar todos os games de um projeto", async () => {
    const mockRepository = createMockRepository();

    const input: ListProjectGamesInput = {
      organizationId: "org-123",
      projectId: "proj-123",
    };

    const result = await listProjectGames(input, mockRepository);

    expect(result.games).toHaveLength(2);
    expect(result.games[0].name).toBe("Game do Projeto 1");
    expect(result.games[1].name).toBe("Game do Projeto 2");
    expect(mockRepository.findByProjectId).toHaveBeenCalledWith(
      "org-123",
      "proj-123",
    );
  });

  it("deve retornar array vazio se projeto não tem games", async () => {
    const mockRepository = createMockRepository([]);

    const input: ListProjectGamesInput = {
      organizationId: "org-123",
      projectId: "proj-sem-games",
    };

    const result = await listProjectGames(input, mockRepository);

    expect(result.games).toEqual([]);
    expect(result.games).toHaveLength(0);
  });

  it("deve propagar erro se repository.findByProjectId falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "findByProjectId").mockRejectedValue(
      new Error("DB error"),
    );

    const input: ListProjectGamesInput = {
      organizationId: "org-123",
      projectId: "proj-123",
    };

    await expect(listProjectGames(input, mockRepository)).rejects.toThrow(
      "DB error",
    );
  });

  it("deve retornar games com projectId correto", async () => {
    const mockRepository = createMockRepository();

    const input: ListProjectGamesInput = {
      organizationId: "org-123",
      projectId: "proj-123",
    };

    const result = await listProjectGames(input, mockRepository);

    for (const game of result.games) {
      expect(game.projectId).toBe("proj-123");
    }
  });
});
