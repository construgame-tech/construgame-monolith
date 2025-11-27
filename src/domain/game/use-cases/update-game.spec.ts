// Testes unitários para o use case updateGame
// Testando lógica de atualização de games

import { describe, expect, it, vi } from "vitest";
import type { GameEntity } from "../entities/game.entity";
import type { IGameRepository } from "../repositories/game.repository.interface";
import { type UpdateGameInput, updateGame } from "./update-game";

describe("updateGame use case", () => {
  const mockGame: GameEntity = {
    id: "game-123",
    organizationId: "org-123",
    projectId: "proj-123",
    name: "Game Original",
    status: "ACTIVE",
    
    archived: false,
  };

  const createMockRepository = (
    game: GameEntity | null = mockGame,
  ): IGameRepository => ({
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(game),
    findByOrganizationId: vi.fn(),
    findByProjectId: vi.fn(),
    delete: vi.fn(),
  });

  it("deve atualizar o nome do game", async () => {
    const mockRepository = createMockRepository();

    const input: UpdateGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
      name: "Nome Atualizado",
    };

    const result = await updateGame(input, mockRepository);

    expect(result.game.name).toBe("Nome Atualizado");
    // sequence removed.toBe(1);
    expect(mockRepository.findById).toHaveBeenCalledWith("org-123", "game-123");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve atualizar o status do game", async () => {
    const mockRepository = createMockRepository();

    const input: UpdateGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
      status: "PAUSED",
    };

    const result = await updateGame(input, mockRepository);

    expect(result.game.status).toBe("PAUSED");
  });

  it("deve atualizar múltiplos campos", async () => {
    const mockRepository = createMockRepository();

    const input: UpdateGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
      name: "Novo Nome",
      status: "DONE",
      objective: "Novo objetivo",
      startDate: "2025-01-15",
      endDate: "2025-06-30",
      prizes: [{ prizeId: "prize-new", type: "points", value: 500 }],
    };

    const result = await updateGame(input, mockRepository);

    expect(result.game.name).toBe("Novo Nome");
    expect(result.game.status).toBe("DONE");
    expect(result.game.objective).toBe("Novo objetivo");
    expect(result.game.startDate).toBe("2025-01-15");
    expect(result.game.endDate).toBe("2025-06-30");
    expect(result.game.prizes).toHaveLength(1);
  });

  it("deve lançar erro se game não encontrado", async () => {
    const mockRepository = createMockRepository(null);

    const input: UpdateGameInput = {
      organizationId: "org-123",
      gameId: "game-inexistente",
      name: "Novo Nome",
    };

    await expect(updateGame(input, mockRepository)).rejects.toThrow(
      "Game not found: game-inexistente",
    );
  });

  it("deve manter campos não atualizados", async () => {
    const gameWithExtras: GameEntity = {
      ...mockGame,
      photo: "https://example.com/photo.jpg",
      objective: "Objetivo original",
    };
    const mockRepository = createMockRepository(gameWithExtras);

    const input: UpdateGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
      name: "Apenas Nome Alterado",
    };

    const result = await updateGame(input, mockRepository);

    expect(result.game.name).toBe("Apenas Nome Alterado");
    expect(result.game.photo).toBe("https://example.com/photo.jpg");
    expect(result.game.objective).toBe("Objetivo original");
  });

  it("deve chamar save com game atualizado", async () => {
    const mockRepository = createMockRepository();

    const input: UpdateGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
      name: "Nome para Salvar",
    };

    await updateGame(input, mockRepository);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "game-123",
        name: "Nome para Salvar",
        
      }),
    );
  });

  it("deve propagar erro se repository.save falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "save").mockRejectedValue(
      new Error("Save failed"),
    );

    const input: UpdateGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
      name: "Nome",
    };

    await expect(updateGame(input, mockRepository)).rejects.toThrow(
      "Save failed",
    );
  });
});
