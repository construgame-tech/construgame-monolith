// Entidade de domínio: Task Manager
// Representa um agrupamento/template de tarefas recorrentes

export type TaskManagerResponsibleType = "team" | "player";

export interface TaskManagerResponsible {
  type: TaskManagerResponsibleType;
  ids: string[];
}

export interface TaskManagerRecurrence {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

export interface TaskManagerSchedule {
  startDate: string;
  endDate: string;
  recurrence?: TaskManagerRecurrence;
}

export interface TaskManagerMacrostep {
  macrostepId: string;
  activityId: string;
}

export interface TaskManagerChecklist {
  id: string;
  label: string;
  checked: boolean;
}

export interface TaskManagerTask {
  id: string;
  progressAbsolute: number;
}

export interface TaskManagerEntity {
  id: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  kpiId: string;
  macrostep?: TaskManagerMacrostep;
  name: string;
  rewardPoints: number;
  location?: string;
  description?: string;
  measurementUnit?: string;
  totalMeasurementExpected?: string;
  videoUrl?: string;
  embedVideoUrl?: string;
  responsible: TaskManagerResponsible;
  schedule: TaskManagerSchedule;
  checklist?: TaskManagerChecklist[];
  progressAbsolute?: number;
  tasks?: TaskManagerTask[];
  sequence: number;
}

// Factory function para criar um novo task manager
export const createTaskManagerEntity = (
  props: Omit<TaskManagerEntity, "sequence" | "progressAbsolute" | "tasks">,
): TaskManagerEntity => {
  return {
    ...props,
    progressAbsolute: 0,
    tasks: [],
    sequence: 0,
  };
};

// Factory function para atualizar um task manager
export const updateTaskManagerEntity = (
  current: TaskManagerEntity,
  updates: Partial<
    Omit<TaskManagerEntity, "id" | "organizationId" | "sequence">
  >,
): TaskManagerEntity => {
  return {
    ...current,
    ...updates,
    sequence: current.sequence + 1,
  };
};

// Incrementa sequence para deleção
export const incrementTaskManagerSequence = (
  taskManager: TaskManagerEntity,
): TaskManagerEntity => {
  return {
    ...taskManager,
    sequence: taskManager.sequence + 1,
  };
};
