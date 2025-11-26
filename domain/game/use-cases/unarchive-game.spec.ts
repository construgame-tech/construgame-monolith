// Testes unitários para o use case unarchiveGame
// Testando lógica de desarquivamento de games

import { describe, expect, it, vi } from "vitest";
import type { GameEntity } from "../entities/game.entity";
import type { IGameRepository } from "../repositories/game.repository.interface";
import { type UnarchiveGameInput, unarchiveGame } from "./unarchive-game";

describe("unarchiveGame use case", () => {
  const mockArchivedGame: GameEntity = {
    id: "game-123",
    organizationId: "org-123",
    projectId: "proj-123",
    name: "Game Arquivado",
    status: "DONE",
    sequence: 5,
    archived: true,
  };

  const createMockRepository = (
    game: GameEntity | null = mockArchivedGame,
  ): IGameRepository => ({
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(game),
    findByOrganizationId: vi.fn(),
    findByProjectId: vi.fn(),
    delete: vi.fn(),
  });

  it("deve desarquivar um game existente", async () => {
    const mockRepository = createMockRepository();

    const input: UnarchiveGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    const result = await unarchiveGame(input, mockRepository);

    expect(result.game.archived).toBe(false);
    expect(result.game.sequence).toBe(6);
    expect(mockRepository.findById).toHaveBeenCalledWith("org-123", "game-123");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve lançar erro se game não encontrado", async () => {
    const mockRepository = createMockRepository(null);

    const input: UnarchiveGameInput = {
      organizationId: "org-123",
      gameId: "game-inexistente",
    };

    await expect(unarchiveGame(input, mockRepository)).rejects.toThrow(
      "Game not found: game-inexistente",
    );
  });

  it("deve manter outros campos ao desarquivar", async () => {
    const mockRepository = createMockRepository();

    const input: UnarchiveGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    const result = await unarchiveGame(input, mockRepository);

    expect(result.game.name).toBe("Game Arquivado");
    expect(result.game.status).toBe("DONE");
    expect(result.game.id).toBe("game-123");
  });

  it("deve chamar save com game desarquivado", async () => {
    const mockRepository = createMockRepository();

    const input: UnarchiveGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    await unarchiveGame(input, mockRepository);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        archived: false,
        sequence: 6,
      }),
    );
  });

  it("deve propagar erro se repository.save falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "save").mockRejectedValue(
      new Error("Unarchive failed"),
    );

    const input: UnarchiveGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    await expect(unarchiveGame(input, mockRepository)).rejects.toThrow(
      "Unarchive failed",
    );
  });
});
