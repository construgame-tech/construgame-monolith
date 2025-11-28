import { describe, it, expect, vi, beforeEach } from "vitest";
import { createKaizenIdea } from "./create-kaizen-idea";
import type { IKaizenIdeaRepository } from "../repositories/kaizen-idea.repository.interface";

describe("createKaizenIdea", () => {
  let mockRepository: IKaizenIdeaRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findByOrganizationId: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("deve criar uma ideia de kaizen com sucesso", async () => {
    const input = {
      organizationId: "org-123",
      name: "Otimizar fluxo de trabalho",
    };

    const result = await createKaizenIdea(input, mockRepository);

    expect(result.idea).toBeDefined();
    expect(result.idea.id).toBeDefined();
    expect(result.idea.organizationId).toBe("org-123");
    expect(result.idea.name).toBe("Otimizar fluxo de trabalho");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve criar ideia com campos opcionais", async () => {
    const input = {
      organizationId: "org-123",
      name: "Nova Ferramenta",
      projectId: "proj-123",
      gameId: "game-123",
      kaizenTypeId: "type-123",
      isRecommended: true,
    };

    const result = await createKaizenIdea(input, mockRepository);

    expect(result.idea.projectId).toBe("proj-123");
    expect(result.idea.gameId).toBe("game-123");
    expect(result.idea.kaizenTypeId).toBe("type-123");
    expect(result.idea.isRecommended).toBe(true);
  });

  it("deve gerar IDs únicos para cada ideia", async () => {
    const input = {
      organizationId: "org-123",
      name: "Ideia Test",
    };

    const result1 = await createKaizenIdea(input, mockRepository);
    const result2 = await createKaizenIdea(input, mockRepository);

    expect(result1.idea.id).not.toBe(result2.idea.id);
  });
});
