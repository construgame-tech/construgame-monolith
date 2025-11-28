// Use Case: Atualizar um task template existente
import { TaskTemplateEntity, updateTaskTemplateEntity } from "../entities/task-template.entity";
import type { ITaskTemplateRepository } from "../repositories/task-template.repository.interface";

export interface UpdateTaskTemplateInput {
  templateId: string;
  kpiId?: string;
  name?: string;
  rewardPoints?: number;
  description?: string;
  measurementUnit?: string;
  totalMeasurementExpected?: string;
}

export interface UpdateTaskTemplateOutput {
  template: TaskTemplateEntity;
}

export const updateTaskTemplate = async (
  input: UpdateTaskTemplateInput,
  repository: ITaskTemplateRepository,
): Promise<UpdateTaskTemplateOutput> => {
  const currentTemplate = await repository.findById(input.templateId);

  if (!currentTemplate) {
    throw new Error(`Task template not found: ${input.templateId}`);
  }

  const updatedTemplate = updateTaskTemplateEntity(currentTemplate, {
    kpiId: input.kpiId,
    name: input.name,
    rewardPoints: input.rewardPoints,
    description: input.description,
    measurementUnit: input.measurementUnit,
    totalMeasurementExpected: input.totalMeasurementExpected,
  });

  await repository.save(updatedTemplate);

  return { template: updatedTemplate };
};
