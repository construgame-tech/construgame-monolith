// Helper: Calcular progresso de uma task
// Calcula o progresso baseado em measurement, checklist ou atualizações qualitativas

import { TaskEntity } from "../entities/task.entity";

const calculateTaskMeasurementProgress = (task: TaskEntity) => {
  if (!task.totalMeasurementExpected) return;

  const expectedMaximum = parseInt(task.totalMeasurementExpected);
  const newProgress =
    task.updates?.reduce((sum, update) => sum + (update.progress || 0), 0) ?? 0;
  const newPercent = Math.round((newProgress / expectedMaximum) * 100);

  return {
    absolute: newProgress > expectedMaximum ? expectedMaximum : newProgress,
    percent: Math.min(newPercent, 100),
  };
};

const calculateTaskChecklistProgress = (task: TaskEntity) => {
  if (!task.checklist || task.checklist.length === 0) return;

  const totalChecklistItems = task.checklist.length;
  const doneChecklistItems =
    task.checklist?.filter((item) => item.checked).length ?? 0;
  const progressPercent = Math.round(
    (doneChecklistItems / totalChecklistItems) * 100,
  );

  return {
    absolute: undefined,
    percent: Math.min(progressPercent, 100),
  };
};

const isQualitativeTaskDone = (task: TaskEntity) =>
  task.updates && task.updates.length > 0;

export const calculateTaskProgress = (
  task: TaskEntity,
): { absolute?: number; percent: number } => {
  const measurementProgress = calculateTaskMeasurementProgress(task);
  const checklistProgress = calculateTaskChecklistProgress(task);

  if (!measurementProgress) {
    // Se a task não tem measurement nem checklist, é qualitativa
    if (!checklistProgress) {
      const isTaskDone = isQualitativeTaskDone(task);
      return { absolute: undefined, percent: isTaskDone ? 100 : 0 };
    }

    // Se a task tem apenas checklist, retorna o progresso do checklist
    return checklistProgress;
  }

  // Se a task tem measurement e não tem checklist, retorna o progresso do measurement
  if (!checklistProgress) return measurementProgress;

  // Se a task tem measurement e checklist, retorna a média dos dois
  return {
    absolute: measurementProgress.absolute,
    percent: Math.round(
      measurementProgress.percent / 2 + checklistProgress.percent / 2,
    ),
  };
};
