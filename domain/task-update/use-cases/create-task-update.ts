// Use Case: Criar um novo task update

import { randomUUID } from "crypto";
import {
  createTaskUpdateEntity,
  TaskUpdateChecklistItem,
  TaskUpdateEntity,
  TaskUpdateFile,
} from "../entities/task-update.entity";
import { calculateProgressPercent } from "../helpers/calculate-progress-percent";
import { getCurrentTimestamp } from "../helpers/get-current-timestamp";
import { roundNumber } from "../helpers/round-number";
import { ITaskUpdateRepository } from "../repositories/task-update.repository.interface";

export interface CreateTaskUpdateInput {
  gameId: string;
  taskId: string;
  submittedBy: string;
  participants?: string[];
  photos?: string[];
  startDate?: Date;
  endDate?: Date;
  progress: {
    absolute?: number;
    hours?: number;
    note?: string;
  };
  checklist?: TaskUpdateChecklistItem[];
  files?: TaskUpdateFile[];
  totalMeasurementExpected?: string; // Usado para calcular o percentual de progresso
}

export interface CreateTaskUpdateOutput {
  taskUpdate: TaskUpdateEntity;
}

export const createTaskUpdate = async (
  input: CreateTaskUpdateInput,
  taskUpdateRepository: ITaskUpdateRepository,
): Promise<CreateTaskUpdateOutput> => {
  // Gera um ID único para o novo task update
  const taskUpdateId = randomUUID();

  // Calcula o percentual de progresso
  const progressPercent = calculateProgressPercent(
    input.progress.absolute,
    input.totalMeasurementExpected,
  );

  // Arredonda os valores de progresso
  const progressAbsolute = input.progress.absolute
    ? roundNumber(input.progress.absolute)
    : undefined;
  const progressHours = input.progress.hours
    ? roundNumber(input.progress.hours)
    : undefined;

  // Cria a entidade de domínio
  const taskUpdate = createTaskUpdateEntity({
    id: taskUpdateId,
    gameId: input.gameId,
    taskId: input.taskId,
    submittedBy: input.submittedBy,
    participants: input.participants,
    photos: input.photos,
    startDate: input.startDate,
    endDate: input.endDate,
    progress: {
      absolute: progressAbsolute,
      percent: progressPercent,
      hours: progressHours,
      note: input.progress.note,
      updatedAt: getCurrentTimestamp(),
    },
    checklist: input.checklist,
    files: input.files,
  });

  // Persiste no repositório
  await taskUpdateRepository.save(taskUpdate);

  return { taskUpdate };
};
