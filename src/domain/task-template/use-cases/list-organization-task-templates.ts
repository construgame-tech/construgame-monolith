// Use Case: Listar task templates de uma organização
import type { TaskTemplateEntity } from "../entities/task-template.entity";
import type { ITaskTemplateRepository } from "../repositories/task-template.repository.interface";

export interface ListOrganizationTaskTemplatesInput {
  organizationId: string;
}

export interface ListOrganizationTaskTemplatesOutput {
  templates: TaskTemplateEntity[];
}

export const listOrganizationTaskTemplates = async (
  input: ListOrganizationTaskTemplatesInput,
  repository: ITaskTemplateRepository,
): Promise<ListOrganizationTaskTemplatesOutput> => {
  const templates = await repository.findByOrganizationId(input.organizationId);

  return { templates };
};
