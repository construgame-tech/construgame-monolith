// Testes unitários para o use case createKaizen

import { describe, it, expect, vi } from "vitest";
import { createKaizen, type CreateKaizenInput } from "./create-kaizen";
import type { IKaizenRepository } from "../repositories/kaizen.repository.interface";

describe("createKaizen use case", () => {
  const createMockRepository = (): IKaizenRepository => ({
    save: vi.fn().mockResolvedValue(undefined),
    saveMultiple: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn(),
    findByIds: vi.fn(),
    findByGameId: vi.fn(),
    findByLeaderId: vi.fn(),
    findByTeamId: vi.fn(),
    findByOrganizationId: vi.fn(),
    findByProjectId: vi.fn(),
  });

  it("deve criar um kaizen com ID gerado automaticamente", async () => {
    const mockRepository = createMockRepository();

    const input: CreateKaizenInput = {
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      name: "Novo Kaizen",
    };

    const result = await createKaizen(input, mockRepository);

    expect(result.kaizen).toBeDefined();
    expect(result.kaizen.id).toBeDefined();
    expect(result.kaizen.id).toHaveLength(36);
    expect(result.kaizen.name).toBe("Novo Kaizen");
    expect(result.kaizen.status).toBe("ACTIVE");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve criar kaizen com campos opcionais", async () => {
    const mockRepository = createMockRepository();

    const input: CreateKaizenInput = {
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      name: "Kaizen Completo",
      authorId: "author-123",
      description: "Descrição",
      leaderId: "leader-123",
      teamId: "team-123",
      category: 1,
      currentSituation: "Situação",
      solution: "Solução",
      tasks: [{ name: "Task", isComplete: false, responsibleId: "user-1" }],
      benefits: [{ kpiId: "kpi-1" }],
      kaizenTypeId: "type-1",
    };

    const result = await createKaizen(input, mockRepository);

    expect(result.kaizen.authorId).toBe("author-123");
    expect(result.kaizen.leaderId).toBe("leader-123");
    expect(result.kaizen.tasks).toHaveLength(1);
    expect(result.kaizen.benefits).toHaveLength(1);
  });

  it("deve propagar erro se repository.save falhar", async () => {
    const mockRepository = createMockRepository();
    vi.spyOn(mockRepository, "save").mockRejectedValue(new Error("DB error"));

    const input: CreateKaizenInput = {
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      name: "Kaizen",
    };

    await expect(createKaizen(input, mockRepository)).rejects.toThrow("DB error");
  });
});
