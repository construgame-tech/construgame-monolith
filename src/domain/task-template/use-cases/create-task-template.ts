// Use Case: Criar um novo task template
import { randomUUID } from "node:crypto";
import { createTaskTemplateEntity, TaskTemplateEntity } from "../entities/task-template.entity";
import type { ITaskTemplateRepository } from "../repositories/task-template.repository.interface";

export interface CreateTaskTemplateInput {
  organizationId: string;
  kpiId: string;
  name: string;
  rewardPoints: number;
  description?: string;
  measurementUnit?: string;
  totalMeasurementExpected?: string;
}

export interface CreateTaskTemplateOutput {
  template: TaskTemplateEntity;
}

export const createTaskTemplate = async (
  input: CreateTaskTemplateInput,
  repository: ITaskTemplateRepository,
): Promise<CreateTaskTemplateOutput> => {
  const template = createTaskTemplateEntity({
    id: randomUUID(),
    organizationId: input.organizationId,
    kpiId: input.kpiId,
    name: input.name,
    rewardPoints: input.rewardPoints,
    description: input.description,
    measurementUnit: input.measurementUnit,
    totalMeasurementExpected: input.totalMeasurementExpected,
  });

  await repository.save(template);

  return { template };
};
