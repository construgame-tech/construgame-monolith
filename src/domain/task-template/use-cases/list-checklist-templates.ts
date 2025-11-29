// Use Case: Listar Checklist Templates de uma Organização
// Retorna todos os templates de checklist de uma organização

import type { ChecklistTemplateEntity } from "../entities/checklist-template.entity";
import type { IChecklistTemplateRepository } from "../repositories/checklist-template.repository.interface";

export interface ListChecklistTemplatesInput {
  organizationId: string;
}

export interface ListChecklistTemplatesOutput {
  templates: ChecklistTemplateEntity[];
}

export const listChecklistTemplates = async (
  input: ListChecklistTemplatesInput,
  repository: IChecklistTemplateRepository,
): Promise<ListChecklistTemplatesOutput> => {
  const templates = await repository.findByOrganizationId(input.organizationId);
  return { templates };
};
