// Service de Checklist Templates
// Orquestra os use cases do domínio

import {
  type ChecklistItem,
  ChecklistTemplateNotFoundError,
  createChecklistTemplate,
  deleteChecklistTemplate,
  getChecklistTemplate,
  listChecklistTemplates,
  updateChecklistTemplate,
} from "@domain/task-template";
import { ChecklistTemplateRepository } from "@infrastructure/repositories/checklist-template.repository";
import { Injectable, NotFoundException } from "@nestjs/common";

export interface CreateChecklistTemplateInput {
  organizationId: string;
  name: string;
  checklist: ChecklistItem[];
}

export interface UpdateChecklistTemplateInput {
  id: string;
  name?: string;
  checklist?: ChecklistItem[];
}

@Injectable()
export class ChecklistTemplateService {
  constructor(
    private readonly checklistTemplateRepository: ChecklistTemplateRepository,
  ) {}

  async create(input: CreateChecklistTemplateInput) {
    const result = await createChecklistTemplate(
      {
        organizationId: input.organizationId,
        name: input.name,
        checklist: input.checklist,
      },
      this.checklistTemplateRepository,
    );
    return result.template;
  }

  async update(input: UpdateChecklistTemplateInput) {
    try {
      const result = await updateChecklistTemplate(
        {
          id: input.id,
          name: input.name,
          checklist: input.checklist,
        },
        this.checklistTemplateRepository,
      );
      return result.template;
    } catch (error) {
      if (error instanceof ChecklistTemplateNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async findById(id: string) {
    const result = await getChecklistTemplate(
      { id },
      this.checklistTemplateRepository,
    );
    if (!result.template) {
      throw new NotFoundException(
        `Checklist template com ID ${id} não encontrado`,
      );
    }
    return result.template;
  }

  async findByOrganizationId(organizationId: string) {
    const result = await listChecklistTemplates(
      { organizationId },
      this.checklistTemplateRepository,
    );
    return result.templates;
  }

  async delete(id: string) {
    await deleteChecklistTemplate({ id }, this.checklistTemplateRepository);
  }
}
