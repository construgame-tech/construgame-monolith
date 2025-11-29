// Use Case: Criar Checklist Template
// Cria um novo template de checklist reutilizável para uma organização

import { randomUUID } from "node:crypto";
import {
  type ChecklistItem,
  type ChecklistTemplateEntity,
  createChecklistTemplateEntity,
} from "../entities/checklist-template.entity";
import type { IChecklistTemplateRepository } from "../repositories/checklist-template.repository.interface";

export interface CreateChecklistTemplateInput {
  organizationId: string;
  name: string;
  checklist: ChecklistItem[];
}

export interface CreateChecklistTemplateOutput {
  template: ChecklistTemplateEntity;
}

export const createChecklistTemplate = async (
  input: CreateChecklistTemplateInput,
  repository: IChecklistTemplateRepository,
): Promise<CreateChecklistTemplateOutput> => {
  const template = createChecklistTemplateEntity({
    id: randomUUID(),
    organizationId: input.organizationId,
    name: input.name,
    checklist: input.checklist,
  });

  await repository.save(template);

  return { template };
};
