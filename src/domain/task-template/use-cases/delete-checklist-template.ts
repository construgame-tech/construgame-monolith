// Use Case: Deletar Checklist Template
// Remove um template de checklist

import type { IChecklistTemplateRepository } from "../repositories/checklist-template.repository.interface";

export interface DeleteChecklistTemplateInput {
  id: string;
}

export const deleteChecklistTemplate = async (
  input: DeleteChecklistTemplateInput,
  repository: IChecklistTemplateRepository,
): Promise<void> => {
  await repository.delete(input.id);
};
