// Entidade de domínio: Task
// Representa uma tarefa de jogo com progresso, checklist e atualizações

export type TaskStatus = "active" | "completed";

export type TaskUpdateStatus = "APPROVED";

export interface TaskChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface TaskChecklistItemInput {
  id?: string;
  label: string;
}

export interface TaskUpdateReview {
  reviwedBy?: string;
  reviwedAt: string;
  reviewNote?: string;
}

export interface TaskUpdate {
  id: string;
  status: TaskUpdateStatus;
  submittedBy: string;
  submittedAt: string;
  participants?: string[];
  photos?: string[];
  hoursTakenToComplete?: number;
  progress?: number;
  progressPercent?: number;
  progressNote?: string;
  review?: TaskUpdateReview;
  checklist?: {
    id: string;
    checked: boolean;
  }[];
}

export interface TaskProgress {
  absolute?: number;
  percent?: number;
  updatedAt: string;
}

export interface TaskEntity {
  id: string;
  gameId: string;
  status: TaskStatus;
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
  checklist?: TaskChecklistItem[];
  startDate?: string;
  endDate?: string;
  progress?: TaskProgress;
  updates?: TaskUpdate[];
  pendingReviewUpdates?: {
    count: number;
    progress: number;
  };
}

// Factory function para criar uma nova task
export const createTaskEntity = (props: {
  id: string;
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
  checklist?: TaskChecklistItem[];
  startDate?: string;
  endDate?: string;
}): TaskEntity => {
  return {
    id: props.id,
    gameId: props.gameId,
    status: "active",
    name: props.name,
    rewardPoints: props.rewardPoints,
    isLocked: props.isLocked,
    location: props.location,
    teamId: props.teamId,
    userId: props.userId,
    kpiId: props.kpiId,
    taskManagerId: props.taskManagerId,
    managerId: props.managerId,
    description: props.description,
    measurementUnit: props.measurementUnit,
    totalMeasurementExpected: props.totalMeasurementExpected,
    videoUrl: props.videoUrl,
    embedVideoUrl: props.embedVideoUrl,
    checklist: props.checklist,
    startDate: props.startDate,
    endDate: props.endDate,
  };
};

// Factory function para atualizar uma task
export const updateTaskEntity = (
  currentTask: TaskEntity,
  updates: {
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
    checklist?: TaskChecklistItem[];
    startDate?: string;
    endDate?: string;
  },
): TaskEntity => {
  return {
    ...currentTask,
    name: updates.name ?? currentTask.name,
    rewardPoints: updates.rewardPoints ?? currentTask.rewardPoints,
    isLocked: updates.isLocked ?? currentTask.isLocked,
    location: updates.location ?? currentTask.location,
    teamId: updates.teamId ?? currentTask.teamId,
    userId: updates.userId ?? currentTask.userId,
    kpiId: updates.kpiId ?? currentTask.kpiId,
    managerId: updates.managerId ?? currentTask.managerId,
    description: updates.description ?? currentTask.description,
    measurementUnit: updates.measurementUnit ?? currentTask.measurementUnit,
    totalMeasurementExpected:
      updates.totalMeasurementExpected ?? currentTask.totalMeasurementExpected,
    videoUrl: updates.videoUrl ?? currentTask.videoUrl,
    embedVideoUrl: updates.embedVideoUrl ?? currentTask.embedVideoUrl,
    checklist: updates.checklist ?? currentTask.checklist,
    startDate: updates.startDate ?? currentTask.startDate,
    endDate: updates.endDate ?? currentTask.endDate,
  };
};

// Validação: task não pode ter teamId e userId ao mesmo tempo
export const validateTaskAssignment = (
  teamId?: string,
  userId?: string,
): void => {
  if (teamId && userId) {
    throw new Error(
      "Task cannot be assigned to both team and user at the same time",
    );
  }
};
