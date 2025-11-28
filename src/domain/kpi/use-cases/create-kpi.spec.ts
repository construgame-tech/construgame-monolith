import { describe, it, expect, vi, beforeEach } from "vitest";
import { createKpi } from "./create-kpi";
import type { IKpiRepository } from "../repositories/kpi.repository.interface";

describe("createKpi", () => {
  let mockRepository: IKpiRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("deve criar um KPI com sucesso", async () => {
    const input = {
      name: "Produtividade",
      type: "percentage",
    };

    const result = await createKpi(input, mockRepository);

    expect(result.kpi).toBeDefined();
    expect(result.kpi.id).toBeDefined();
    expect(result.kpi.name).toBe("Produtividade");
    expect(result.kpi.type).toBe("percentage");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve criar KPI com campo photo opcional", async () => {
    const input = {
      name: "Qualidade",
      type: "number",
      photo: "https://example.com/kpi.jpg",
    };

    const result = await createKpi(input, mockRepository);

    expect(result.kpi.photo).toBe("https://example.com/kpi.jpg");
  });

  it("deve gerar IDs únicos para cada KPI", async () => {
    const input = {
      name: "KPI Test",
      type: "percentage",
    };

    const result1 = await createKpi(input, mockRepository);
    const result2 = await createKpi(input, mockRepository);

    expect(result1.kpi.id).not.toBe(result2.kpi.id);
  });
});
