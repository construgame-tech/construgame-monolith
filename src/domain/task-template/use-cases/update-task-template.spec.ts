import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateTaskTemplate } from "./update-task-template";
import type { ITaskTemplateRepository } from "../repositories/task-template.repository.interface";

describe("updateTaskTemplate", () => {
  let mockRepository: ITaskTemplateRepository;

  const existingTemplate = {
    id: "template-123",
    organizationId: "org-123",
    kpiId: "kpi-123",
    name: "Original Name",
    rewardPoints: 100,
    description: "Original description",
  };

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(existingTemplate),
      findById: vi.fn().mockResolvedValue(existingTemplate),
      findByOrganizationId: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("deve atualizar o nome do template", async () => {
    const input = {
      templateId: "template-123",
      name: "Updated Name",
    };

    const result = await updateTaskTemplate(input, mockRepository);

    expect(result.template.name).toBe("Updated Name");
    expect(mockRepository.findById).toHaveBeenCalledWith("template-123");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve atualizar múltiplos campos", async () => {
    const input = {
      templateId: "template-123",
      name: "New Name",
      rewardPoints: 200,
      description: "New description",
    };

    const result = await updateTaskTemplate(input, mockRepository);

    expect(result.template.name).toBe("New Name");
    expect(result.template.rewardPoints).toBe(200);
    expect(result.template.description).toBe("New description");
  });

  it("deve lançar erro quando template não existe", async () => {
    mockRepository.findById = vi.fn().mockResolvedValue(null);

    const input = {
      templateId: "nonexistent-id",
      name: "Updated Name",
    };

    await expect(updateTaskTemplate(input, mockRepository)).rejects.toThrow(
      "Task template not found: nonexistent-id"
    );
  });

  it("deve manter valores originais quando não atualizados", async () => {
    const input = {
      templateId: "template-123",
      name: "Updated Name",
    };

    const result = await updateTaskTemplate(input, mockRepository);

    expect(result.template.kpiId).toBe("kpi-123");
    expect(result.template.rewardPoints).toBe(100);
  });
});
