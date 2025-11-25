// Use Case: Criar uma nova task

import { randomUUID } from "node:crypto";
import {
  createTaskEntity,
  TaskChecklistItemInput,
  TaskEntity,
  validateTaskAssignment,
} from "../entities/task.entity";
import { ITaskRepository } from "../repositories/task.repository.interface";

export interface CreateTaskInput {
  taskId?: string; // Permite passar um ID específico (útil para migrações)
  gameId: string;
  name: string;
  rewardPoints: number;
  isLocked?: boolean;
  location?: string;
  teamId?: string;
  userId?: string;
  kpiId?: string;
  taskManagerId?: string;
  managerId?: string;
  description?: string;
  measurementUnit?: string;
  totalMeasurementExpected?: string;
  videoUrl?: string;
  embedVideoUrl?: string;
  checklist?: TaskChecklistItemInput[];
  startDate?: string;
  endDate?: string;
}

export interface CreateTaskOutput {
  task: TaskEntity;
}

export const createTask = async (
  input: CreateTaskInput,
  taskRepository: ITaskRepository,
): Promise<CreateTaskOutput> => {
  // Valida que não pode ter teamId e userId ao mesmo tempo
  validateTaskAssignment(input.teamId, input.userId);

  // Gera um ID único para a nova task (ou usa o fornecido)
  const taskId = input.taskId ?? randomUUID();

  // Prepara o checklist com IDs
  const checklist = input.checklist?.map((item) => ({
    id: item.id ?? randomUUID(),
    label: item.label,
    checked: false,
  }));

  // Cria a entidade de domínio
  const task = createTaskEntity({
    id: taskId,
    gameId: input.gameId,
    name: input.name,
    rewardPoints: input.rewardPoints,
    isLocked: input.isLocked,
    location: input.location,
    teamId: input.teamId,
    userId: input.userId,
    kpiId: input.kpiId,
    taskManagerId: input.taskManagerId,
    managerId: input.managerId,
    description: input.description,
    measurementUnit: input.measurementUnit,
    totalMeasurementExpected: input.totalMeasurementExpected,
    videoUrl: input.videoUrl,
    embedVideoUrl: input.embedVideoUrl,
    checklist,
    startDate: input.startDate,
    endDate: input.endDate,
  });

  // Persiste no repositório
  await taskRepository.save(task);

  return { task };
};
