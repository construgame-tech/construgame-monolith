import { describe, it, expect, vi, beforeEach } from "vitest";
import { createKaizenType } from "./create-kaizen-type";
import type { IKaizenTypeRepository } from "../repositories/kaizen-type.repository.interface";

describe("createKaizenType", () => {
  let mockRepository: IKaizenTypeRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findByOrganizationId: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("deve criar um tipo de kaizen com sucesso", async () => {
    const input = {
      organizationId: "org-123",
      name: "Melhoria de Processo",
      points: 50,
    };

    const result = await createKaizenType(input, mockRepository);

    expect(result.type).toBeDefined();
    expect(result.type.id).toBeDefined();
    expect(result.type.organizationId).toBe("org-123");
    expect(result.type.name).toBe("Melhoria de Processo");
    expect(result.type.points).toBe(50);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve criar tipo de kaizen com campos opcionais", async () => {
    const input = {
      organizationId: "org-123",
      name: "Inovação",
      points: 100,
      description: "Ideias inovadoras para o produto",
      ideaPoints: 20,
      ideaExecutionPoints: 80,
    };

    const result = await createKaizenType(input, mockRepository);

    expect(result.type.description).toBe("Ideias inovadoras para o produto");
    expect(result.type.ideaPoints).toBe(20);
    expect(result.type.ideaExecutionPoints).toBe(80);
  });

  it("deve gerar IDs únicos para cada tipo", async () => {
    const input = {
      organizationId: "org-123",
      name: "Tipo Test",
      points: 10,
    };

    const result1 = await createKaizenType(input, mockRepository);
    const result2 = await createKaizenType(input, mockRepository);

    expect(result1.type.id).not.toBe(result2.type.id);
  });
});
