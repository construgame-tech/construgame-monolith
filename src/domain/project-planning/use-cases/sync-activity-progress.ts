/**
 * Use Case: Sincronizar Progresso da Atividade
 *
 * Orquestra o processo de recalcular e persistir o progresso de uma atividade
 * e, opcionalmente, da macroetapa associada.
 */

import { calculateActivityProgress } from "./calculate-activity-progress";
import { calculateMacrostepProgress } from "./calculate-macrostep-progress";

export interface TaskData {
  progressAbsolute: number;
}

export interface ActivityData {
  id: string;
  macrostepId: string;
  totalMeasurementExpected?: string | number | null;
  progressPercent?: number | null;
}

export interface MacrostepData {
  id: string;
  progressPercent?: number | null;
}

/**
 * Interface do repositório de atividades para o use case
 */
export interface IActivityProgressRepository {
  findActivityById(activityId: string): Promise<ActivityData | null>;
  updateActivityProgress(
    activityId: string,
    progressPercent: number,
  ): Promise<void>;
  findActivitiesByMacrostepId(macrostepId: string): Promise<ActivityData[]>;
  updateMacrostepProgress(
    macrostepId: string,
    progressPercent: number,
  ): Promise<void>;
}

/**
 * Interface do repositório de tasks para o use case
 */
export interface ITaskProgressRepository {
  findTasksByActivityId(activityId: string): Promise<TaskData[]>;
}

export interface SyncActivityProgressInput {
  activityId: string;
  syncMacrostep?: boolean; // Se true, também recalcula o progresso do macrostep
}

export interface SyncActivityProgressOutput {
  activityId: string;
  activityProgress: number;
  macrostepId?: string;
  macrostepProgress?: number;
}

/**
 * Sincroniza o progresso de uma atividade e opcionalmente da macroetapa.
 *
 * @param input - ID da atividade e flag para sincronizar macrostep
 * @param activityRepository - Repositório de atividades
 * @param taskRepository - Repositório de tasks
 * @returns Dados do progresso atualizado
 */
export const syncActivityProgress = async (
  input: SyncActivityProgressInput,
  activityRepository: IActivityProgressRepository,
  taskRepository: ITaskProgressRepository,
): Promise<SyncActivityProgressOutput | null> => {
  const { activityId, syncMacrostep = true } = input;

  // 1. Buscar a atividade
  const activity = await activityRepository.findActivityById(activityId);
  if (!activity) {
    return null;
  }

  // 2. Buscar tasks associadas à atividade
  const tasks = await taskRepository.findTasksByActivityId(activityId);

  // 3. Calcular o progresso da atividade
  const totalMeasurementExpected =
    typeof activity.totalMeasurementExpected === "string"
      ? Number.parseFloat(activity.totalMeasurementExpected)
      : activity.totalMeasurementExpected;

  const { progressPercent: activityProgress } = calculateActivityProgress({
    totalMeasurementExpected,
    tasks,
  });

  // 4. Persistir o progresso da atividade
  await activityRepository.updateActivityProgress(activityId, activityProgress);

  const result: SyncActivityProgressOutput = {
    activityId,
    activityProgress,
  };

  // 5. Se solicitado, sincronizar também o macrostep
  if (syncMacrostep && activity.macrostepId) {
    const activities = await activityRepository.findActivitiesByMacrostepId(
      activity.macrostepId,
    );

    // Atualizar a atividade atual na lista (para usar o progresso recém-calculado)
    const updatedActivities = activities.map((a) =>
      a.id === activityId ? { ...a, progressPercent: activityProgress } : a,
    );

    const { progressPercent: macrostepProgress } = calculateMacrostepProgress({
      activities: updatedActivities,
    });

    await activityRepository.updateMacrostepProgress(
      activity.macrostepId,
      macrostepProgress,
    );

    result.macrostepId = activity.macrostepId;
    result.macrostepProgress = macrostepProgress;
  }

  return result;
};
