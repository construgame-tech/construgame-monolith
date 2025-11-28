// Use Case: Remover um task template
import type { ITaskTemplateRepository } from "../repositories/task-template.repository.interface";

export interface DeleteTaskTemplateInput {
  templateId: string;
}

export const deleteTaskTemplate = async (
  input: DeleteTaskTemplateInput,
  repository: ITaskTemplateRepository,
): Promise<void> => {
  const template = await repository.findById(input.templateId);

  if (!template) {
    throw new Error(`Task template not found: ${input.templateId}`);
  }

  await repository.delete(input.templateId);
};
