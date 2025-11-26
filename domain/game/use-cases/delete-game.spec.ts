// Testes unitários para o use case deleteGame
// Testando lógica de deleção de games

import { describe, expect, it, vi } from "vitest";
import type { GameEntity } from "../entities/game.entity";
import type { IGameRepository } from "../repositories/game.repository.interface";
import { type DeleteGameInput, deleteGame } from "./delete-game";

describe("deleteGame use case", () => {
  const mockGame: GameEntity = {
    id: "game-123",
    organizationId: "org-123",
    projectId: "proj-123",
    name: "Game para Deletar",
    status: "ACTIVE",
    sequence: 0,
    archived: false,
  };

  const createMockRepository = (
    game: GameEntity | null = mockGame,
  ): IGameRepository => ({
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(game),
    findByOrganizationId: vi.fn(),
    findByProjectId: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
  });

  it("deve deletar um game existente", async () => {
    const mockRepository = createMockRepository();

    const input: DeleteGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    const result = await deleteGame(input, mockRepository);

    expect(result.success).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith("org-123", "game-123");
    expect(mockRepository.delete).toHaveBeenCalledWith("org-123", "game-123");
  });

  it("deve lançar erro se game não encontrado", async () => {
    const mockRepository = createMockRepository(null);

    const input: DeleteGameInput = {
      organizationId: "org-123",
      gameId: "game-inexistente",
    };

    await expect(deleteGame(input, mockRepository)).rejects.toThrow(
      "Game not found: game-inexistente",
    );
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it("deve propagar erro se repository.delete falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "delete").mockRejectedValue(
      new Error("Delete failed"),
    );

    const input: DeleteGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    await expect(deleteGame(input, mockRepository)).rejects.toThrow(
      "Delete failed",
    );
  });

  it("deve verificar existência antes de deletar", async () => {
    const mockRepository = createMockRepository();

    const input: DeleteGameInput = {
      organizationId: "org-123",
      gameId: "game-123",
    };

    await deleteGame(input, mockRepository);

    // Verifica que findById e delete foram chamados
    expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });
});
