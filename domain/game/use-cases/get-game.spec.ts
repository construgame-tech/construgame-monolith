// Testes unitários para o use case getGame
// Testando lógica de busca de games

import { describe, expect, it, vi } from "vitest";
import type { GameEntity } from "../entities/game.entity";
import type { IGameRepository } from "../repositories/game.repository.interface";
import { type GetGameInput, getGame } from "./get-game";

describe("getGame use case", () => {
  const mockGame: GameEntity = {
    id: "game-123",
    organizationId: "org-123",
    projectId: "proj-123",
    name: "Game de Teste",
    status: "ACTIVE",
    sequence: 0,
    archived: false,
  };

  const createMockRepository = (
    game: GameEntity | null = mockGame,
  ): IGameRepository => ({
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(game),
    findByOrganizationId: vi.fn(),
    findByProjectId: vi.fn(),
    delete: vi.fn(),
  });

  it("deve retornar game quando encontrado", async () => {
    const mockRepository = createMockRepository();

    const input: GetGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    const result = await getGame(input, mockRepository);

    expect(result.game).toBeDefined();
    expect(result.game?.id).toBe("game-123");
    expect(result.game?.name).toBe("Game de Teste");
    expect(mockRepository.findById).toHaveBeenCalledWith("org-123", "game-123");
  });

  it("deve retornar null quando game não encontrado", async () => {
    const mockRepository = createMockRepository(null);

    const input: GetGameInput = {
      organizationId: "org-123",
      gameId: "game-inexistente",
    };

    const result = await getGame(input, mockRepository);

    expect(result.game).toBeNull();
  });

  it("deve retornar game com todos os campos", async () => {
    const gameCompleto: GameEntity = {
      id: "game-123",
      organizationId: "org-123",
      projectId: "proj-123",
      name: "Game Completo",
      status: "DONE",
      sequence: 10,
      archived: false,
      photo: "https://example.com/photo.jpg",
      objective: "Objetivo do game",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      prizes: [{ prizeId: "prize-1", type: "points", value: 100 }],
      kpis: [{ id: "kpi-1", points: 50 }],
    };
    const mockRepository = createMockRepository(gameCompleto);

    const input: GetGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    const result = await getGame(input, mockRepository);

    expect(result.game).toEqual(gameCompleto);
  });

  it("deve propagar erro se repository.findById falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "findById").mockRejectedValue(
      new Error("DB error"),
    );

    const input: GetGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    await expect(getGame(input, mockRepository)).rejects.toThrow("DB error");
  });
});
