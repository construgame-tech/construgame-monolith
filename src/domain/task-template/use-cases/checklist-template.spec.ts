// Testes para os use cases de Checklist Template

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChecklistTemplateEntity } from "../entities/checklist-template.entity";
import type { IChecklistTemplateRepository } from "../repositories/checklist-template.repository.interface";
import { createChecklistTemplate } from "./create-checklist-template";
import { deleteChecklistTemplate } from "./delete-checklist-template";
import { getChecklistTemplate } from "./get-checklist-template";
import { listChecklistTemplates } from "./list-checklist-templates";
import {
  ChecklistTemplateNotFoundError,
  updateChecklistTemplate,
} from "./update-checklist-template";

// Factory para criar mock do repositório
const createMockRepository = (): IChecklistTemplateRepository => ({
  save: vi.fn(),
  findById: vi.fn(),
  findByOrganizationId: vi.fn(),
  delete: vi.fn(),
});

// Factory para criar template de teste
const createTestTemplate = (
  overrides?: Partial<ChecklistTemplateEntity>,
): ChecklistTemplateEntity => ({
  id: "template-123",
  organizationId: "org-123",
  name: "Template de Teste",
  checklist: [{ label: "Item 1" }, { label: "Item 2" }],
  ...overrides,
});

describe("Checklist Template Use Cases", () => {
  let mockRepository: IChecklistTemplateRepository;

  beforeEach(() => {
    mockRepository = createMockRepository();
  });

  describe("createChecklistTemplate", () => {
    it("deve criar um novo checklist template com ID gerado", async () => {
      const input = {
        organizationId: "org-123",
        name: "Novo Template",
        checklist: [{ label: "Item A" }, { label: "Item B" }],
      };

      const result = await createChecklistTemplate(input, mockRepository);

      expect(result.template).toBeDefined();
      expect(result.template.id).toBeDefined();
      expect(result.template.organizationId).toBe("org-123");
      expect(result.template.name).toBe("Novo Template");
      expect(result.template.checklist).toHaveLength(2);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org-123",
          name: "Novo Template",
        }),
      );
    });

    it("deve criar template com checklist vazio", async () => {
      const input = {
        organizationId: "org-123",
        name: "Template Vazio",
        checklist: [],
      };

      const result = await createChecklistTemplate(input, mockRepository);

      expect(result.template.checklist).toHaveLength(0);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateChecklistTemplate", () => {
    it("deve atualizar o nome do template", async () => {
      const existing = createTestTemplate();
      vi.mocked(mockRepository.findById).mockResolvedValue(existing);

      const result = await updateChecklistTemplate(
        { id: "template-123", name: "Nome Atualizado" },
        mockRepository,
      );

      expect(result.template.name).toBe("Nome Atualizado");
      expect(result.template.checklist).toEqual(existing.checklist);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it("deve atualizar o checklist do template", async () => {
      const existing = createTestTemplate();
      vi.mocked(mockRepository.findById).mockResolvedValue(existing);

      const newChecklist = [{ label: "Novo Item" }];
      const result = await updateChecklistTemplate(
        { id: "template-123", checklist: newChecklist },
        mockRepository,
      );

      expect(result.template.checklist).toEqual(newChecklist);
      expect(result.template.name).toBe(existing.name);
    });

    it("deve lançar erro quando template não existe", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(
        updateChecklistTemplate(
          { id: "nao-existe", name: "Teste" },
          mockRepository,
        ),
      ).rejects.toThrow(ChecklistTemplateNotFoundError);
    });
  });

  describe("getChecklistTemplate", () => {
    it("deve retornar template quando encontrado", async () => {
      const template = createTestTemplate();
      vi.mocked(mockRepository.findById).mockResolvedValue(template);

      const result = await getChecklistTemplate(
        { id: "template-123" },
        mockRepository,
      );

      expect(result.template).toEqual(template);
      expect(mockRepository.findById).toHaveBeenCalledWith("template-123");
    });

    it("deve retornar null quando template não existe", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await getChecklistTemplate(
        { id: "nao-existe" },
        mockRepository,
      );

      expect(result.template).toBeNull();
    });
  });

  describe("listChecklistTemplates", () => {
    it("deve listar templates da organização", async () => {
      const templates = [
        createTestTemplate({ id: "t1", name: "Template 1" }),
        createTestTemplate({ id: "t2", name: "Template 2" }),
      ];
      vi.mocked(mockRepository.findByOrganizationId).mockResolvedValue(
        templates,
      );

      const result = await listChecklistTemplates(
        { organizationId: "org-123" },
        mockRepository,
      );

      expect(result.templates).toHaveLength(2);
      expect(mockRepository.findByOrganizationId).toHaveBeenCalledWith(
        "org-123",
      );
    });

    it("deve retornar array vazio quando não há templates", async () => {
      vi.mocked(mockRepository.findByOrganizationId).mockResolvedValue([]);

      const result = await listChecklistTemplates(
        { organizationId: "org-vazio" },
        mockRepository,
      );

      expect(result.templates).toHaveLength(0);
    });
  });

  describe("deleteChecklistTemplate", () => {
    it("deve deletar template pelo ID", async () => {
      await deleteChecklistTemplate({ id: "template-123" }, mockRepository);

      expect(mockRepository.delete).toHaveBeenCalledWith("template-123");
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
