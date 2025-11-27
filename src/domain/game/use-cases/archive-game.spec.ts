// Testes unitários para o use case archiveGame
// Testando lógica de arquivamento de games

import { describe, expect, it, vi } from "vitest";
import type { GameEntity } from "../entities/game.entity";
import type { IGameRepository } from "../repositories/game.repository.interface";
import { type ArchiveGameInput, archiveGame } from "./archive-game";

describe("archiveGame use case", () => {
  const mockGame: GameEntity = {
    id: "game-123",
    organizationId: "org-123",
    projectId: "proj-123",
    name: "Game",
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

  it("deve arquivar um game existente", async () => {
    const mockRepository = createMockRepository();

    const input: ArchiveGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    const result = await archiveGame(input, mockRepository);

    expect(result.game.archived).toBe(true);
    // sequence removed.toBe(1);
    expect(mockRepository.findById).toHaveBeenCalledWith("org-123", "game-123");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve lançar erro se game não encontrado", async () => {
    const mockRepository = createMockRepository(null);

    const input: ArchiveGameInput = {
      organizationId: "org-123",
      gameId: "game-inexistente",
    };

    await expect(archiveGame(input, mockRepository)).rejects.toThrow(
      "Game not found: game-inexistente",
    );
  });

  it("deve manter outros campos ao arquivar", async () => {
    const gameWithData: GameEntity = {
      ...mockGame,
      name: "Game Especial",
      status: "DONE",
      objective: "Objetivo importante",
    };
    const mockRepository = createMockRepository(gameWithData);

    const input: ArchiveGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    const result = await archiveGame(input, mockRepository);

    expect(result.game.name).toBe("Game Especial");
    expect(result.game.status).toBe("DONE");
    expect(result.game.objective).toBe("Objetivo importante");
    expect(result.game.archived).toBe(true);
  });

  it("deve chamar save com game arquivado", async () => {
    const mockRepository = createMockRepository();

    const input: ArchiveGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    await archiveGame(input, mockRepository);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        archived: true,
        
      }),
    );
  });

  it("deve propagar erro se repository.save falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "save").mockRejectedValue(
      new Error("Archive failed"),
    );

    const input: ArchiveGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    await expect(archiveGame(input, mockRepository)).rejects.toThrow(
      "Archive failed",
    );
  });
});
