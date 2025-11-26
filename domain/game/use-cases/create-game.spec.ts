// Testes unitários para o use case createGame
// Testando lógica de negócio pura com repositório mockado

import { describe, expect, it, vi } from "vitest";
import type { IGameRepository } from "../repositories/game.repository.interface";
import { type CreateGameInput, createGame } from "./create-game";

describe("createGame use case", () => {
  const createMockRepository = (): IGameRepository => ({
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn(),
    findByOrganizationId: vi.fn(),
    findByProjectId: vi.fn(),
    delete: vi.fn(),
  });

  it("deve criar um game com ID gerado automaticamente", async () => {
    const mockRepository = createMockRepository();

    const input: CreateGameInput = {
      organizationId: "org-123",
      projectId: "proj-123",
      name: "Novo Game",
    };

    const result = await createGame(input, mockRepository);

    expect(result.game).toBeDefined();
    expect(result.game.id).toBeDefined();
    expect(result.game.id).toHaveLength(36); // UUID format
    expect(result.game.name).toBe("Novo Game");
    expect(result.game.organizationId).toBe("org-123");
    expect(result.game.projectId).toBe("proj-123");
    expect(result.game.status).toBe("ACTIVE");
    expect(result.game.sequence).toBe(0);
    expect(result.game.archived).toBe(false);
  });

  it("deve chamar repository.save com o game criado", async () => {
    const mockRepository = createMockRepository();

    const input: CreateGameInput = {
      organizationId: "org-123",
      projectId: "proj-123",
      name: "Game para Salvar",
    };

    await createGame(input, mockRepository);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-123",
        projectId: "proj-123",
        name: "Game para Salvar",
      }),
    );
  });

  it("deve criar game com campos opcionais", async () => {
    const mockRepository = createMockRepository();

    const input: CreateGameInput = {
      organizationId: "org-123",
      projectId: "proj-123",
      name: "Game Completo",
      gameManagerId: "manager-123",
      photo: "https://example.com/photo.jpg",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      managerId: "manager-456",
      responsibles: ["resp-1", "resp-2"],
      objective: "Objetivo do game",
      updateFrequency: 7,
      prizes: [{ prizeId: "prize-1", type: "points", value: 100 }],
      kpis: [{ id: "kpi-1", points: 50 }],
    };

    const result = await createGame(input, mockRepository);

    expect(result.game.gameManagerId).toBe("manager-123");
    expect(result.game.photo).toBe("https://example.com/photo.jpg");
    expect(result.game.startDate).toBe("2025-01-01");
    expect(result.game.endDate).toBe("2025-12-31");
    expect(result.game.managerId).toBe("manager-456");
    expect(result.game.responsibles).toEqual(["resp-1", "resp-2"]);
    expect(result.game.objective).toBe("Objetivo do game");
    expect(result.game.updateFrequency).toBe(7);
    expect(result.game.prizes).toHaveLength(1);
    expect(result.game.kpis).toHaveLength(1);
  });

  it("deve propagar erro se repository.save falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "save").mockRejectedValue(new Error("DB error"));

    const input: CreateGameInput = {
      organizationId: "org-123",
      projectId: "proj-123",
      name: "Game que Falha",
    };

    await expect(createGame(input, mockRepository)).rejects.toThrow("DB error");
  });

  it("deve gerar IDs únicos para cada game criado", async () => {
    const mockRepository = createMockRepository();

    const input: CreateGameInput = {
      organizationId: "org-123",
      projectId: "proj-123",
      name: "Game",
    };

    const result1 = await createGame(input, mockRepository);
    const result2 = await createGame(input, mockRepository);

    expect(result1.game.id).not.toBe(result2.game.id);
  });
});
