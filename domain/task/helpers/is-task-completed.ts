// Helper: Verificar se uma task está completa

import { TaskEntity } from "../entities/task.entity";

export const isTaskCompleted = (task: TaskEntity): boolean => {
  // Se a task é qualitativa, qualquer update aprovado completa a task
  return task.progress?.percent === 100;
};
