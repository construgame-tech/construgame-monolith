// Testes unitários para o use case listOrganizationGames
// Testando lógica de listagem de games por organização

import { describe, expect, it, vi } from "vitest";
import type { GameEntity } from "../entities/game.entity";
import type { IGameRepository } from "../repositories/game.repository.interface";
import {
  type ListOrganizationGamesInput,
  listOrganizationGames,
} from "./list-organization-games";

describe("listOrganizationGames use case", () => {
  const mockGames: GameEntity[] = [
    {
      id: "game-1",
      organizationId: "org-123",
      projectId: "proj-1",
      name: "Game 1",
      status: "ACTIVE",
      
      archived: false,
    },
    {
      id: "game-2",
      organizationId: "org-123",
      projectId: "proj-2",
      name: "Game 2",
      status: "DONE",
      
      archived: false,
    },
  ];

  const createMockRepository = (
    games: GameEntity[] = mockGames,
  ): IGameRepository => ({
    save: vi.fn(),
    findById: vi.fn(),
    findByOrganizationId: vi.fn().mockResolvedValue(games),
    findByProjectId: vi.fn(),
    delete: vi.fn(),
  });

  it("deve listar todos os games de uma organização", async () => {
    const mockRepository = createMockRepository();

    const input: ListOrganizationGamesInput = {
      organizationId: "org-123",
    };

    const result = await listOrganizationGames(input, mockRepository);

    expect(result.games).toHaveLength(2);
    expect(result.games[0].name).toBe("Game 1");
    expect(result.games[1].name).toBe("Game 2");
    expect(mockRepository.findByOrganizationId).toHaveBeenCalledWith("org-123");
  });

  it("deve retornar array vazio se organização não tem games", async () => {
    const mockRepository = createMockRepository([]);

    const input: ListOrganizationGamesInput = {
      organizationId: "org-sem-games",
    };

    const result = await listOrganizationGames(input, mockRepository);

    expect(result.games).toEqual([]);
    expect(result.games).toHaveLength(0);
  });

  it("deve propagar erro se repository.findByOrganizationId falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "findByOrganizationId").mockRejectedValue(
      new Error("DB error"),
    );

    const input: ListOrganizationGamesInput = {
      organizationId: "org-123",
    };

    await expect(listOrganizationGames(input, mockRepository)).rejects.toThrow(
      "DB error",
    );
  });

  it("deve retornar games com todos os campos", async () => {
    const gamesCompletos: GameEntity[] = [
      {
        id: "game-1",
        organizationId: "org-123",
        projectId: "proj-1",
        name: "Game Completo",
        status: "ACTIVE",
        
        archived: false,
        photo: "https://example.com/photo.jpg",
        objective: "Objetivo",
        prizes: [{ prizeId: "prize-1" }],
      },
    ];
    const mockRepository = createMockRepository(gamesCompletos);

    const input: ListOrganizationGamesInput = {
      organizationId: "org-123",
    };

    const result = await listOrganizationGames(input, mockRepository);

    expect(result.games[0]).toEqual(gamesCompletos[0]);
  });
});
