import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteTaskTemplate } from "./delete-task-template";
import type { ITaskTemplateRepository } from "../repositories/task-template.repository.interface";

describe("deleteTaskTemplate", () => {
  let mockRepository: ITaskTemplateRepository;

  const existingTemplate = {
    id: "template-123",
    organizationId: "org-123",
    kpiId: "kpi-123",
    name: "Template to Delete",
    rewardPoints: 100,
  };

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingTemplate),
      findByOrganizationId: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("deve deletar um template existente", async () => {
    await deleteTaskTemplate({ templateId: "template-123" }, mockRepository);

    expect(mockRepository.findById).toHaveBeenCalledWith("template-123");
    expect(mockRepository.delete).toHaveBeenCalledWith("template-123");
  });

  it("deve lançar erro quando template não existe", async () => {
    mockRepository.findById = vi.fn().mockResolvedValue(null);

    await expect(
      deleteTaskTemplate({ templateId: "nonexistent-id" }, mockRepository)
    ).rejects.toThrow("Task template not found: nonexistent-id");
  });

  it("não deve chamar delete se template não existe", async () => {
    mockRepository.findById = vi.fn().mockResolvedValue(null);

    try {
      await deleteTaskTemplate({ templateId: "nonexistent-id" }, mockRepository);
    } catch {
      // Esperado
    }

    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});
