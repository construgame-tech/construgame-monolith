// Use Case: Buscar um task template por ID
import type { TaskTemplateEntity } from "../entities/task-template.entity";
import type { ITaskTemplateRepository } from "../repositories/task-template.repository.interface";

export interface GetTaskTemplateInput {
  templateId: string;
}

export interface GetTaskTemplateOutput {
  template: TaskTemplateEntity;
}

export const getTaskTemplate = async (
  input: GetTaskTemplateInput,
  repository: ITaskTemplateRepository,
): Promise<GetTaskTemplateOutput> => {
  const template = await repository.findById(input.templateId);

  if (!template) {
    throw new Error(`Task template not found: ${input.templateId}`);
  }

  return { template };
};
