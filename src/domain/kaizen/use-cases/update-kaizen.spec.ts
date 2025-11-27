// Testes unitários para o use case updateKaizen

import { describe, expect, it, vi } from "vitest";
import type { KaizenEntity } from "../entities/kaizen.entity";
import type { IKaizenRepository } from "../repositories/kaizen.repository.interface";
import { type UpdateKaizenInput, updateKaizen } from "./update-kaizen";

describe("updateKaizen use case", () => {
  const baseKaizen: KaizenEntity = {
    id: "kaizen-123",
    organizationId: "org-123",
    projectId: "proj-123",
    gameId: "game-123",
    name: "Kaizen Original",
    status: "ACTIVE",
    createdDate: "2025-01-01T00:00:00.000Z",
    
  };

  const createMockRepository = (
    kaizen: KaizenEntity | null = baseKaizen,
  ): IKaizenRepository => ({
    save: vi.fn().mockResolvedValue(undefined),
    saveMultiple: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(kaizen),
    findByIds: vi.fn().mockResolvedValue([]),
    findByGameId: vi.fn(),
    findByLeaderId: vi.fn(),
    findByTeamId: vi.fn(),
    findByOrganizationId: vi.fn(),
    findByProjectId: vi.fn(),
  });

  it("deve atualizar um kaizen existente", async () => {
    const mockRepository = createMockRepository();

    const input: UpdateKaizenInput = {
      kaizenId: "kaizen-123",
      name: "Nome Atualizado",
      currentSituation: "Nova situação",
    };

    const result = await updateKaizen(input, mockRepository);

    expect(result.kaizen.name).toBe("Nome Atualizado");
    expect(result.kaizen.currentSituation).toBe("Nova situação");
    // sequence removed.toBe(1);
    expect(mockRepository.findById).toHaveBeenCalledWith("kaizen-123");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve lançar erro se kaizen não encontrado", async () => {
    const mockRepository = createMockRepository(null);

    const input: UpdateKaizenInput = {
      kaizenId: "inexistente",
      name: "Nome",
    };

    await expect(updateKaizen(input, mockRepository)).rejects.toThrow(
      "Kaizen not found: inexistente",
    );
  });

  it("deve atualizar réplicas quando nome/categoria mudam", async () => {
    const kaizenWithReplicas: KaizenEntity = {
      ...baseKaizen,
      replicas: ["replica-1", "replica-2"],
    };
    const replicas: KaizenEntity[] = [
      { ...baseKaizen, id: "replica-1", originalKaizenId: "kaizen-123" },
      { ...baseKaizen, id: "replica-2", originalKaizenId: "kaizen-123" },
    ];
    const mockRepository = createMockRepository(kaizenWithReplicas);
    vi.spyOn(mockRepository, "findByIds").mockResolvedValue(replicas);

    const input: UpdateKaizenInput = {
      kaizenId: "kaizen-123",
      name: "Nome Novo",
    };

    await updateKaizen(input, mockRepository);

    expect(mockRepository.findByIds).toHaveBeenCalledWith([
      "replica-1",
      "replica-2",
    ]);
    expect(mockRepository.saveMultiple).toHaveBeenCalledTimes(1);
  });

  it("deve chamar save normal quando não há réplicas ou campos relevantes não mudam", async () => {
    const mockRepository = createMockRepository();

    const input: UpdateKaizenInput = {
      kaizenId: "kaizen-123",
      currentSituation: "Nova situação",
    };

    await updateKaizen(input, mockRepository);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.saveMultiple).not.toHaveBeenCalled();
  });
});
