// Helper: Atualizar progresso de uma task
// Recalcula o progresso da task baseado em todas as suas atualizações

import { TaskEntity, TaskUpdate } from "../entities/task.entity";

const calcPercentage = (total: number, done: number) => {
  const percent = (done / total) * 10000;

  // Arredonda para 2 casas decimais
  const percentRounded = Math.ceil(percent) / 100;

  // Garante que o valor máximo seja 100
  return Math.min(percentRounded, 100);
};

const calcUpdateProgressPercent = (
  task: TaskEntity,
  update: TaskUpdate,
): number => {
  const isQuantitative = task.totalMeasurementExpected !== undefined;
  const hasChecklist = task.checklist && task.checklist.length > 0;
  if (!isQuantitative && !hasChecklist) return 100; // Qualquer update aprovado é 100% de progresso

  // Progresso quantitativo
  const updateProgressAbsolute = update.progress || 0;
  const updateProgressPercent = calcPercentage(
    Number(task.totalMeasurementExpected),
    updateProgressAbsolute,
  );

  // Progresso do checklist
  if (task.checklist && task.checklist.length > 0) {
    const taskUpdateIndex = task.updates?.findIndex(
      (taskUpdate) => taskUpdate.id === update.id,
    );
    const previousUpdates = task.updates?.slice(0, taskUpdateIndex);
    const previouslyCheckedItems = previousUpdates?.flatMap((update) =>
      update.checklist
        ?.filter((update) => update.checked)
        .map((update) => update.id),
    );
    const checklistCheckedItems =
      update.checklist?.filter(
        (item) => item.checked && !previouslyCheckedItems?.includes(item.id),
      ).length || 0;
    const updateChecklistProgressPercent = calcPercentage(
      task.checklist.length,
      checklistCheckedItems,
    );

    // Se a task tem checklist e é quantitativa, o progresso é a média dos dois
    if (isQuantitative) {
      return Math.min(
        updateProgressPercent / 2 + updateChecklistProgressPercent / 2,
        100,
      );
    }

    // Se a task tem checklist mas não é quantitativa, o progresso é o do checklist
    return Math.min(updateChecklistProgressPercent, 100);
  }

  return Math.min(updateProgressPercent, 100);
};

export const updateTaskProgress = (task: TaskEntity): TaskEntity => {
  let progressPercentLeft = 100;
  const progress = {
    updatedAt: new Date().toISOString(),
    absolute: 0,
    percent: 0,
  };

  task.updates?.forEach((update) => {
    if (progressPercentLeft <= 0) return;

    const updateProgressAbsolute = update.progress || 0;
    const updateProgressPercent = calcUpdateProgressPercent(task, update);

    // Esta seção previne erros de arredondamento e evita que a task fique travada em 99.99%
    const newProgressPercent = Math.min(
      updateProgressPercent,
      progressPercentLeft,
    );

    // Define o progresso percentual do update para calcular os pontos de cada update
    update.progressPercent = newProgressPercent;

    // Atualiza o progresso absoluto da task garantindo que não ultrapasse o total esperado
    const newTaskProgressAbsolute =
      updateProgressAbsolute + (progress.absolute || 0);
    progress.absolute = Math.min(
      newTaskProgressAbsolute,
      Number(task.totalMeasurementExpected) || 0,
    );

    // Atualiza o progresso percentual restante
    progressPercentLeft = Number(
      (progressPercentLeft - newProgressPercent).toFixed(2),
    );
  });

  progress.percent = 100 - progressPercentLeft;
  const status = progressPercentLeft <= 0 ? "completed" : "active";

  return {
    ...task,
    progress,
    status,
  };
};
