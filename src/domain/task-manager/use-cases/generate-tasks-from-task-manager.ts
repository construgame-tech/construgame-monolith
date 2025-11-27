// Use Case: Gera tasks a partir de um Task Manager
// Implementa a lógica de recorrência e distribuição de responsáveis

import type { TaskManagerEntity } from "../entities/task-manager.entity";

export interface GeneratedTask {
  taskManagerId: string;
  gameId: string;
  name: string;
  rewardPoints: number;
  kpiId: string;
  description?: string;
  measurementUnit?: string;
  totalMeasurementExpected?: string;
  videoUrl?: string;
  embedVideoUrl?: string;
  location?: string;
  checklist?: { id: string; label: string; checked: boolean }[];
  responsibleId: string;
  responsibleType: "team" | "user";
  startDate: string;
  endDate: string;
}

type DayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

const getDayOfWeek = (date: Date): DayOfWeek => {
  const days: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[date.getDay()];
};

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Gera tasks a partir de um Task Manager
 * 
 * - Se tiver recorrência: cria uma task para cada dia selecionado × cada responsável
 * - Se não tiver recorrência: cria uma task por responsável (período completo)
 * 
 * @param taskManager - O Task Manager com schedule e responsáveis
 * @returns Array de tasks a serem criadas
 */
export const generateTasksFromTaskManager = (
  taskManager: TaskManagerEntity,
): GeneratedTask[] => {
  const responsibleType = taskManager.responsible.type === "team" ? "team" : "user";
  const tasks: GeneratedTask[] = [];

  const baseTaskData = {
    taskManagerId: taskManager.id,
    gameId: taskManager.gameId,
    name: taskManager.name,
    rewardPoints: taskManager.rewardPoints,
    kpiId: taskManager.kpiId,
    description: taskManager.description,
    measurementUnit: taskManager.measurementUnit,
    totalMeasurementExpected: taskManager.totalMeasurementExpected,
    videoUrl: taskManager.videoUrl,
    embedVideoUrl: taskManager.embedVideoUrl,
    location: taskManager.location,
    checklist: taskManager.checklist?.map((item) => ({
      id: item.id,
      label: item.label,
      checked: false, // Sempre inicia desmarcado
    })),
  };

  // Se for recorrente, cria uma task para cada dia selecionado
  if (taskManager.schedule?.recurrence) {
    const stopDate = new Date(taskManager.schedule.endDate);
    stopDate.setHours(23, 59, 59, 999);
    
    const datePointer = new Date(taskManager.schedule.startDate);
    datePointer.setHours(0, 0, 0, 0);

    while (datePointer <= stopDate) {
      const dayOfWeek = getDayOfWeek(datePointer);

      // Só cria task nos dias selecionados na recorrência
      if (taskManager.schedule.recurrence[dayOfWeek]) {
        const dateStr = formatDate(datePointer);

        // Cria uma task para CADA responsável
        for (const responsibleId of taskManager.responsible.ids) {
          tasks.push({
            ...baseTaskData,
            responsibleId,
            responsibleType,
            startDate: dateStr,
            endDate: dateStr,
          });
        }
      }

      // Avança para o próximo dia
      datePointer.setDate(datePointer.getDate() + 1);
    }

    return tasks;
  }

  // Se NÃO for recorrente, cria uma task por responsável (período completo)
  for (const responsibleId of taskManager.responsible.ids) {
    tasks.push({
      ...baseTaskData,
      responsibleId,
      responsibleType,
      startDate: taskManager.schedule?.startDate,
      endDate: taskManager.schedule?.endDate,
    });
  }

  return tasks;
};

/**
 * Calcula quantas tasks serão geradas para um Task Manager
 * Útil para validação antes de criar
 */
export const countExpectedTasks = (taskManager: TaskManagerEntity): number => {
  const numResponsibles = taskManager.responsible.ids.length;

  if (!taskManager.schedule?.recurrence) {
    // Sem recorrência: 1 task por responsável
    return numResponsibles;
  }

  // Com recorrência: contar dias selecionados no período
  let dayCount = 0;
  const stopDate = new Date(taskManager.schedule.endDate);
  stopDate.setHours(23, 59, 59, 999);
  
  const datePointer = new Date(taskManager.schedule.startDate);
  datePointer.setHours(0, 0, 0, 0);

  while (datePointer <= stopDate) {
    const dayOfWeek = getDayOfWeek(datePointer);
    if (taskManager.schedule.recurrence[dayOfWeek]) {
      dayCount++;
    }
    datePointer.setDate(datePointer.getDate() + 1);
  }

  return dayCount * numResponsibles;
};
