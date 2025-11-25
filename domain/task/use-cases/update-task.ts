// Use Case: Atualizar uma task existente

import {
  TaskChecklistItemInput,
  TaskEntity,
  updateTaskEntity,
} from "../entities/task.entity";
import { updateChecklistPreservingState } from "../helpers/update-checklist-preserving-state";
import { updateTaskProgress } from "../helpers/update-task-progress";
import { ITaskRepository } from "../repositories/task.repository.interface";

export interface UpdateTaskInput {
  gameId: string;
  taskId: string;
  name?: string;
  rewardPoints?: number;
  isLocked?: boolean;
  location?: string;
  teamId?: string;
  userId?: string;
  kpiId?: string;
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

export interface UpdateTaskOutput {
  task: TaskEntity;
}

// Recalcula o percentual de progresso se o totalMeasurementExpected mudou
const recalculatePercentIfNeeded = (
  currentTask: TaskEntity,
  newTotalExpected?: string,
): TaskEntity => {
  if (!currentTask.progress?.absolute || !newTotalExpected) {
    return currentTask;
  }

  const totalMeasurementExpected = Number.parseInt(newTotalExpected);
  const percent = Math.round(
    (currentTask.progress.absolute / totalMeasurementExpected) * 100,
  );

  return {
    ...currentTask,
    progress: {
      ...currentTask.progress,
      percent: Math.min(percent, 100),
    },
  };
};

export const updateTask = async (
  input: UpdateTaskInput,
  taskRepository: ITaskRepository,
): Promise<UpdateTaskOutput> => {
  // Busca a task atual
  const currentTask = await taskRepository.findById(input.gameId, input.taskId);

  if (!currentTask) {
    throw new Error(`Task not found: ${input.taskId}`);
  }

  // Recalcula percentual se necessário
  const taskWithRecalculatedPercent = recalculatePercentIfNeeded(
    currentTask,
    input.totalMeasurementExpected,
  );

  // Atualiza o checklist preservando o estado de checked
  const checklist = updateChecklistPreservingState(
    taskWithRecalculatedPercent.checklist,
    input.checklist,
  );

  // Aplica as atualizações na entidade
  let updatedTask = updateTaskEntity(taskWithRecalculatedPercent, {
    name: input.name,
    rewardPoints: input.rewardPoints,
    isLocked: input.isLocked,
    location: input.location,
    teamId: input.teamId,
    userId: input.userId,
    kpiId: input.kpiId,
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

  // Recalcula o progresso da task baseado nas atualizações
  updatedTask = updateTaskProgress(updatedTask);

  // Persiste no repositório
  await taskRepository.save(updatedTask);

  return { task: updatedTask };
};
