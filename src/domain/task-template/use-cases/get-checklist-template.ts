// Use Case: Obter Checklist Template por ID
// Busca um template de checklist específico pelo ID

import type { ChecklistTemplateEntity } from "../entities/checklist-template.entity";
import type { IChecklistTemplateRepository } from "../repositories/checklist-template.repository.interface";

export interface GetChecklistTemplateInput {
  id: string;
}

export interface GetChecklistTemplateOutput {
  template: ChecklistTemplateEntity | null;
}

export const getChecklistTemplate = async (
  input: GetChecklistTemplateInput,
  repository: IChecklistTemplateRepository,
): Promise<GetChecklistTemplateOutput> => {
  const template = await repository.findById(input.id);
  return { template };
};
