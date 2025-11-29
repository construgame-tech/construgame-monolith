// Use Case: Atualizar Checklist Template
// Atualiza um template de checklist existente

import {
  type ChecklistItem,
  type ChecklistTemplateEntity,
  updateChecklistTemplateEntity,
} from "../entities/checklist-template.entity";
import type { IChecklistTemplateRepository } from "../repositories/checklist-template.repository.interface";

export interface UpdateChecklistTemplateInput {
  id: string;
  name?: string;
  checklist?: ChecklistItem[];
}

export interface UpdateChecklistTemplateOutput {
  template: ChecklistTemplateEntity;
}

export class ChecklistTemplateNotFoundError extends Error {
  constructor(id: string) {
    super(`Checklist template com ID ${id} não encontrado`);
    this.name = "ChecklistTemplateNotFoundError";
  }
}

export const updateChecklistTemplate = async (
  input: UpdateChecklistTemplateInput,
  repository: IChecklistTemplateRepository,
): Promise<UpdateChecklistTemplateOutput> => {
  const existing = await repository.findById(input.id);

  if (!existing) {
    throw new ChecklistTemplateNotFoundError(input.id);
  }

  const updated = updateChecklistTemplateEntity(existing, {
    name: input.name,
    checklist: input.checklist,
  });

  await repository.save(updated);

  return { template: updated };
};
