import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTaskTemplate } from "./create-task-template";
import type { ITaskTemplateRepository } from "../repositories/task-template.repository.interface";

describe("createTaskTemplate", () => {
  let mockRepository: ITaskTemplateRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue({
        id: "generated-id",
        organizationId: "org-123",
        kpiId: "kpi-123",
        name: "Test Template",
        rewardPoints: 100,
      }),
      findById: vi.fn(),
      findByOrganizationId: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("deve criar um task template com sucesso", async () => {
    const input = {
      organizationId: "org-123",
      kpiId: "kpi-123",
      name: "Test Template",
      rewardPoints: 100,
    };

    const result = await createTaskTemplate(input, mockRepository);

    expect(result.template).toBeDefined();
    expect(result.template.id).toBeDefined();
    expect(result.template.organizationId).toBe("org-123");
    expect(result.template.kpiId).toBe("kpi-123");
    expect(result.template.name).toBe("Test Template");
    expect(result.template.rewardPoints).toBe(100);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve criar um task template com campos opcionais", async () => {
    const input = {
      organizationId: "org-123",
      kpiId: "kpi-123",
      name: "Template com Detalhes",
      rewardPoints: 50,
      description: "Descrição do template",
      measurementUnit: "metros",
      totalMeasurementExpected: "100",
    };

    const result = await createTaskTemplate(input, mockRepository);

    expect(result.template.description).toBe("Descrição do template");
    expect(result.template.measurementUnit).toBe("metros");
    expect(result.template.totalMeasurementExpected).toBe("100");
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Descrição do template",
        measurementUnit: "metros",
        totalMeasurementExpected: "100",
      })
    );
  });

  it("deve gerar um ID único para cada template", async () => {
    const input = {
      organizationId: "org-123",
      kpiId: "kpi-123",
      name: "Test",
      rewardPoints: 10,
    };

    const result1 = await createTaskTemplate(input, mockRepository);
    const result2 = await createTaskTemplate(input, mockRepository);

    expect(result1.template.id).not.toBe(result2.template.id);
  });
});
