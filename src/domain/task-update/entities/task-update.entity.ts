// Entidade de domínio: TaskUpdate
// Representa uma atualização de tarefa com progresso, fotos, participantes e checklist

export type TaskUpdateStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface TaskUpdateProgress {
  absolute?: number;
  percent?: number;
  hours?: number;
  note?: string;
  updatedAt: string;
}

export interface TaskUpdateChecklistItem {
  id: string;
  checked: boolean;
}

export interface TaskUpdateFile {
  name: string;
  size: number;
  url: string;
  filetype: string;
  createdAt?: string;
}

export interface TaskUpdateEntity {
  id: string;
  gameId: string;
  taskId: string;
  status: TaskUpdateStatus;
  submittedBy: string;
  reviwedBy?: string;
  reviewNote?: string;
  startDate?: Date;
  endDate?: Date;
  participants?: string[];
  photos?: string[];
  progress: TaskUpdateProgress;
  checklist?: TaskUpdateChecklistItem[];
  files?: TaskUpdateFile[];
}

// Factory function para criar um novo task update
export const createTaskUpdateEntity = (props: {
  id: string;
  gameId: string;
  taskId: string;
  submittedBy: string;
  participants?: string[];
  photos?: string[];
  startDate?: Date;
  endDate?: Date;
  progress: {
    absolute?: number;
    percent?: number;
    hours?: number;
    note?: string;
    updatedAt: string;
  };
  checklist?: TaskUpdateChecklistItem[];
  files?: TaskUpdateFile[];
}): TaskUpdateEntity => {
  return {
    id: props.id,
    gameId: props.gameId,
    taskId: props.taskId,
    status: "PENDING_REVIEW",
    submittedBy: props.submittedBy,
    participants: props.participants,
    photos: props.photos,
    startDate: props.startDate,
    endDate: props.endDate,
    progress: props.progress,
    checklist: props.checklist,
    files: props.files,
  };
};

// Factory function para aprovar um task update
export const approveTaskUpdateEntity = (
  currentTaskUpdate: TaskUpdateEntity,
  props?: {
    reviwedBy?: string;
    reviewNote?: string;
    progressAbsolute?: number;
    participants?: string[];
    checklist?: TaskUpdateChecklistItem[];
    startDate?: Date;
    endDate?: Date;
  },
): TaskUpdateEntity => {
  return {
    ...currentTaskUpdate,
    status: "APPROVED",
    reviwedBy: props?.reviwedBy,
    reviewNote: props?.reviewNote,
    progress: {
      ...currentTaskUpdate.progress,
      absolute: props?.progressAbsolute ?? currentTaskUpdate.progress.absolute,
    },
    participants: props?.participants ?? currentTaskUpdate.participants,
    checklist: props?.checklist ?? currentTaskUpdate.checklist,
    startDate: props?.startDate ?? currentTaskUpdate.startDate,
    endDate: props?.endDate ?? currentTaskUpdate.endDate,
  };
};

// Factory function para rejeitar um task update
export const rejectTaskUpdateEntity = (
  currentTaskUpdate: TaskUpdateEntity,
  props: {
    reviwedBy: string;
    reviewNote?: string;
  },
): TaskUpdateEntity => {
  return {
    ...currentTaskUpdate,
    status: "REJECTED",
    reviwedBy: props.reviwedBy,
    reviewNote: props.reviewNote,
  };
};

// Factory function para cancelar um task update aprovado
export const cancelTaskUpdateEntity = (
  currentTaskUpdate: TaskUpdateEntity,
): TaskUpdateEntity => {
  return {
    ...currentTaskUpdate,
    status: "PENDING_REVIEW",
    reviwedBy: undefined,
    reviewNote: undefined,
  };
};

// Validação: task update deve estar em PENDING_REVIEW para ser aprovado
export const validateCanApprove = (taskUpdate: TaskUpdateEntity): void => {
  if (taskUpdate.status !== "PENDING_REVIEW") {
    throw new Error(
      "Task update must be in PENDING_REVIEW status to be approved",
    );
  }
};

// Validação: task update deve estar em PENDING_REVIEW para ser rejeitado
export const validateCanReject = (taskUpdate: TaskUpdateEntity): void => {
  if (taskUpdate.status !== "PENDING_REVIEW") {
    throw new Error(
      "Task update must be in PENDING_REVIEW status to be rejected",
    );
  }
};

// Validação: task update deve estar em APPROVED para ser cancelado
export const validateCanCancel = (taskUpdate: TaskUpdateEntity): void => {
  if (taskUpdate.status !== "APPROVED") {
    throw new Error("Task update must be in APPROVED status to be cancelled");
  }
};
