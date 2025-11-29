// Helper: Calcular progresso de uma task
// Calcula o progresso baseado em measurement, checklist ou atualizações qualitativas

import type { TaskEntity, TaskUpdate } from "../entities/task.entity";

export interface TaskProgressResult {
  percent: number;
  absolute: number;
  status: "active" | "completed";
}

export interface ChecklistItem {
  id: string;
  checked: boolean;
}

/**
 * Calcula o progresso de uma task baseado no tipo:
 * - Quantitativa (com totalMeasurementExpected): soma dos valores absolutos / meta
 * - Qualitativa (com checklist): itens marcados / total de itens
 * - Fallback: qualquer update aprovado = 100%
 */
export const calculateTaskProgress = (
  task: Pick<TaskEntity, "totalMeasurementExpected" | "checklist">,
  updates: TaskUpdate[],
): TaskProgressResult => {
  const totalMeasurementExpected = Number(task.totalMeasurementExpected) || 0;
  const taskChecklist = task.checklist || [];

  let percent = 0;
  let absolute = 0;

  if (totalMeasurementExpected > 0) {
    // Task quantitativa: soma os valores absolutos dos updates
    absolute = updates.reduce((sum, u) => sum + (u.progress || 0), 0);
    percent = Math.min(
      Math.round((absolute / totalMeasurementExpected) * 100),
      100,
    );
  } else if (taskChecklist.length > 0) {
    // Task qualitativa (checklist): calcula baseado nos itens marcados
    const checklistState = calculateChecklistState(taskChecklist, updates);
    const checkedCount = Array.from(checklistState.values()).filter(
      (v) => v,
    ).length;
    const totalItems = taskChecklist.length;

    percent =
      totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
    absolute = checkedCount; // Para checklist, absolute = número de itens marcados
  } else if (updates.length > 0) {
    // Fallback: sem meta quantitativa nem checklist, qualquer update = 100%
    percent = 100;
  }

  return {
    percent,
    absolute,
    status: percent >= 100 ? "completed" : "active",
  };
};

/**
 * Mescla os estados de checklist de todos os updates aprovados
 * para determinar o estado final de cada item.
 */
export const calculateChecklistState = (
  taskChecklist: Array<{ id: string }>,
  updates: TaskUpdate[],
): Map<string, boolean> => {
  const checklistState = new Map<string, boolean>();

  // Inicializa com todos os itens como não marcados
  for (const item of taskChecklist) {
    checklistState.set(item.id, false);
  }

  // Aplica os estados dos updates aprovados (em ordem cronológica)
  for (const update of updates) {
    if (update.checklist) {
      for (const item of update.checklist) {
        checklistState.set(item.id, item.checked);
      }
    }
  }

  return checklistState;
};

/**
 * Calcula o percentual de um update específico baseado no tipo de task.
 * Usado para calcular pontos proporcionais ao progresso do update.
 */
export const calculateUpdatePercent = (
  task: Pick<TaskEntity, "totalMeasurementExpected" | "checklist">,
  updateProgress?: number,
  updateChecklist?: ChecklistItem[],
): number => {
  const totalMeasurementExpected = Number(task.totalMeasurementExpected) || 0;
  const taskChecklist = task.checklist || [];

  if (totalMeasurementExpected > 0 && updateProgress !== undefined) {
    // Task quantitativa: calcula baseado no valor absoluto
    return Math.round((updateProgress / totalMeasurementExpected) * 100);
  }

  if (taskChecklist.length > 0 && updateChecklist) {
    // Task qualitativa: calcula baseado nos itens marcados neste update
    const checkedCount = updateChecklist.filter((item) => item.checked).length;
    return Math.round((checkedCount / taskChecklist.length) * 100);
  }

  return 0;
};

/**
 * Calcula os pontos a serem creditados baseado no progresso do update.
 * Pontos são proporcionais ao percentual de progresso.
 *
 * Regra de negócio:
 * - progressPercent é limitado a 100% (cap)
 * - Pontos = (progressPercent / 100) × rewardPoints
 * - Arredonda para inteiro (pontos não são fracionados no cálculo total)
 */
export const calculatePointsToCredit = (
  rewardPoints: number,
  progressPercent: number,
): number => {
  if (progressPercent <= 0) return 0;

  // Cap progressPercent em 100%
  const cappedPercent = Math.min(progressPercent, 100);

  return Math.round((cappedPercent / 100) * rewardPoints);
};
