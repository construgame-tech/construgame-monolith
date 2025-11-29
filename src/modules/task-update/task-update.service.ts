import type { GameEntity } from "@domain/game/entities/game.entity";
import {
  creditTeamTaskPoints,
  creditUserTaskPoints,
} from "@domain/game-points";
import type { TaskEntity } from "@domain/task/entities/task.entity";
import {
  calculatePointsToCredit,
  calculateTaskProgress,
  calculateUpdatePercent,
} from "@domain/task/helpers/calculate-task-progress";
import { createTaskUpdate, rejectTaskUpdate } from "@domain/task-update";
import {
  approveTaskUpdateEntity,
  cancelTaskUpdateEntity,
  TaskUpdateStatus,
} from "@domain/task-update/entities/task-update.entity";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import type {
  TeamGamePointsRepository,
  UserGamePointsRepository,
} from "@infrastructure/repositories/game-points.repository";
import { TaskRepository } from "@infrastructure/repositories/task.repository";
import { TaskUpdateRepository } from "@infrastructure/repositories/task-update.repository";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ApproveTaskUpdateDto } from "./dto/approve-task-update.dto";
import { CreateTaskUpdateDto } from "./dto/create-task-update.dto";
import { RejectTaskUpdateDto } from "./dto/reject-task-update.dto";

@Injectable()
export class TaskUpdateService {
  constructor(
    @Inject("TaskUpdateRepository")
    private readonly taskUpdateRepository: TaskUpdateRepository,
    @Inject("ITaskRepository")
    private readonly taskRepository: TaskRepository,
    @Inject("IGameRepository")
    private readonly gameRepository: GameRepository,
    @Inject("UserGamePointsRepository")
    private readonly userGamePointsRepository: UserGamePointsRepository,
    @Inject("TeamGamePointsRepository")
    private readonly teamGamePointsRepository: TeamGamePointsRepository,
  ) {}

  async create(dto: CreateTaskUpdateDto) {
    // Buscar a task para obter totalMeasurementExpected
    const task = await this.taskRepository.findById(dto.gameId, dto.taskId);

    const { taskUpdate } = await createTaskUpdate(
      {
        gameId: dto.gameId,
        taskId: dto.taskId,
        submittedBy: dto.submittedBy,
        participants: dto.participants,
        photos: dto.photos,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        progress: {
          absolute: dto.progress.absolute,
          hours: dto.progress.hours,
          note: dto.progress.note,
        },
        checklist: dto.checklist,
        files: dto.files,
        totalMeasurementExpected: task?.totalMeasurementExpected,
      },
      this.taskUpdateRepository,
    );

    return taskUpdate;
  }

  async findById(id: string) {
    const update = await this.taskUpdateRepository.findById(id);
    if (!update) {
      throw new NotFoundException(`Task update with ID ${id} not found`);
    }
    return update;
  }

  async findByTaskId(taskId: string) {
    return this.taskUpdateRepository.findByTaskId(taskId);
  }

  async findByGameId(gameId: string) {
    return this.taskUpdateRepository.findByGameId(gameId);
  }

  async findByStatus(gameId: string, status: TaskUpdateStatus) {
    return this.taskUpdateRepository.findByStatus(gameId, status);
  }

  async approve(id: string, dto: ApproveTaskUpdateDto) {
    const current = await this.findById(id);

    // Se já está aprovado, não reprocessar (regra de negócio validada aqui por simplicidade)
    if (current.status === "APPROVED") {
      return current;
    }

    // Buscar a Task e Game para contexto
    const task = await this.taskRepository.findById(
      current.gameId,
      current.taskId,
    );
    const game = await this.gameRepository.findByIdOnly(current.gameId);

    // Usar domain helper para calcular o percent do update
    const progressAbsolute = dto.progressAbsolute ?? current.progress.absolute;
    const updateChecklist = dto.checklist ?? current.checklist;
    const calculatedPercent = task
      ? calculateUpdatePercent(task, progressAbsolute, updateChecklist)
      : current.progress.percent;

    const updated = approveTaskUpdateEntity(current, {
      reviwedBy: dto.reviewedBy,
      reviewNote: dto.reviewNote,
      progressAbsolute: dto.progressAbsolute,
      participants: dto.participants,
      checklist: dto.checklist,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });

    // Adicionar o percent calculado ao progress
    const updatedWithPercent = {
      ...updated,
      progress: {
        ...updated.progress,
        percent: calculatedPercent,
      },
    };

    // Salva o task update aprovado com percent
    const savedUpdate =
      await this.taskUpdateRepository.save(updatedWithPercent);

    // Atualiza o progresso da Task
    await this.updateTaskProgress(
      current.gameId,
      current.taskId,
      updatedWithPercent,
    );

    // Creditar pontos aos participantes e times
    if (task && game) {
      const participants = dto.participants ?? current.participants ?? [];
      // Se não houver participantes definidos, credita ao submitter
      const pointRecipients =
        participants.length > 0 ? participants : [current.submittedBy];

      await this.creditTaskPoints({
        task,
        game,
        progressPercent: calculatedPercent ?? 0,
        participants: pointRecipients,
      });
    }

    return savedUpdate;
  }

  /**
   * Credita pontos proporcionais ao progresso da task.
   * Os pontos são divididos igualmente entre os participantes.
   *
   * Regra de negócio:
   * - Pontos totais = progressPercent × rewardPoints (limite 100%)
   * - Cada participante recebe = pontos totais / número de participantes
   * - Time recebe os pontos totais (não dividido)
   * - Precisão de 4 casas decimais
   */
  private async creditTaskPoints(params: {
    task: TaskEntity;
    game: GameEntity;
    progressPercent: number;
    participants: string[];
  }) {
    const { task, game, progressPercent, participants } = params;

    // Usa domain helper para calcular pontos proporcionais ao progresso
    const totalPointsToCredit = calculatePointsToCredit(
      task.rewardPoints,
      progressPercent,
    );

    if (totalPointsToCredit <= 0) return;

    // Divide igualmente entre os participantes com precisão de 4 decimais
    const participantCount = participants.length || 1;
    const pointsPerParticipant =
      Math.round((totalPointsToCredit / participantCount) * 10000) / 10000;

    // 1. Creditar pontos divididos a cada participante
    for (const userId of participants) {
      await creditUserTaskPoints(
        {
          userId,
          gameId: game.id,
          organizationId: game.organizationId,
          projectId: game.projectId,
          pointsToCredit: pointsPerParticipant,
        },
        this.userGamePointsRepository,
      );
    }

    // 2. Creditar pontos totais ao time (se a task pertence a um time)
    // O time recebe os pontos totais, não dividido pelos participantes
    if (task.teamId) {
      await creditTeamTaskPoints(
        {
          teamId: task.teamId,
          gameId: game.id,
          organizationId: game.organizationId,
          projectId: game.projectId,
          pointsToCredit: totalPointsToCredit,
        },
        this.teamGamePointsRepository,
      );
    }
  }

  /**
   * Atualiza o progresso da Task quando um task-update é aprovado.
   * Adiciona o update à lista de updates da task e recalcula o progresso usando domain helper.
   */
  private async updateTaskProgress(
    gameId: string,
    taskId: string,
    approvedUpdate: {
      id: string;
      submittedBy: string;
      participants?: string[];
      photos?: string[];
      progress: {
        absolute?: number;
        percent?: number;
        hours?: number;
        note?: string;
        updatedAt: string;
      };
      checklist?: { id: string; checked: boolean }[];
      reviwedBy?: string;
      reviewNote?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const task = await this.taskRepository.findById(gameId, taskId);
    if (!task) {
      return; // Task não encontrada, nada a fazer
    }

    // Cria o objeto TaskUpdate para adicionar à lista de updates da task
    const taskUpdate = {
      id: approvedUpdate.id,
      status: "APPROVED" as const,
      submittedBy: approvedUpdate.submittedBy,
      submittedAt: approvedUpdate.progress.updatedAt,
      participants: approvedUpdate.participants,
      photos: approvedUpdate.photos,
      hoursTakenToComplete: approvedUpdate.progress.hours,
      progress: approvedUpdate.progress.absolute,
      progressNote: approvedUpdate.progress.note,
      review: approvedUpdate.reviwedBy
        ? {
            reviwedBy: approvedUpdate.reviwedBy,
            reviwedAt: new Date().toISOString(),
            reviewNote: approvedUpdate.reviewNote,
          }
        : undefined,
      checklist: approvedUpdate.checklist,
    };

    // Remove update existente com mesmo ID (evita duplicatas) e adiciona o novo
    const existingUpdates = task.updates || [];
    const filteredUpdates = existingUpdates.filter(
      (u) => u.id !== approvedUpdate.id,
    );
    const updatedUpdates = [...filteredUpdates, taskUpdate];

    // Usa domain helper para calcular o progresso
    const progressResult = calculateTaskProgress(task, updatedUpdates);

    // Atualiza a task com o novo progresso
    const updatedTask = {
      ...task,
      updates: updatedUpdates,
      progress: {
        absolute: progressResult.absolute,
        percent: progressResult.percent,
        updatedAt: new Date().toISOString(),
      },
      status: progressResult.status,
    };

    await this.taskRepository.save(updatedTask);
  }

  async reject(id: string, dto: RejectTaskUpdateDto) {
    const current = await this.findById(id);
    const { taskUpdate } = await rejectTaskUpdate(
      {
        taskId: current.taskId,
        taskUpdateId: current.id,
        reviwedBy: dto.reviewedBy || "",
        reviewNote: dto.reviewNote,
      },
      this.taskUpdateRepository,
    );
    return taskUpdate;
  }

  async delete(id: string) {
    await this.findById(id);
    return this.taskUpdateRepository.delete(id);
  }

  async cancel(id: string) {
    const current = await this.findById(id);

    // Se o update estava aprovado, remove o progresso da Task
    if (current.status === "APPROVED") {
      await this.removeTaskProgress(current.gameId, current.taskId, current.id);
    }

    const updated = cancelTaskUpdateEntity(current);
    return this.taskUpdateRepository.save(updated);
  }

  /**
   * Remove um update da lista de updates da Task e recalcula o progresso.
   * Usado quando um update aprovado é cancelado.
   * Usa domain helper para recalcular o progresso.
   */
  private async removeTaskProgress(
    gameId: string,
    taskId: string,
    updateId: string,
  ) {
    const task = await this.taskRepository.findById(gameId, taskId);
    if (!task) {
      return;
    }

    // Remove o update da lista
    const updatedUpdates = (task.updates || []).filter(
      (u) => u.id !== updateId,
    );

    // Usa domain helper para recalcular o progresso
    const progressResult = calculateTaskProgress(task, updatedUpdates);

    const updatedTask = {
      ...task,
      updates: updatedUpdates,
      progress: {
        absolute: progressResult.absolute,
        percent: progressResult.percent,
        updatedAt: new Date().toISOString(),
      },
      status: progressResult.status,
    };

    await this.taskRepository.save(updatedTask);
  }

  async findByOrganizationId(
    organizationId: string,
    filters?: {
      status?: TaskUpdateStatus;
      submittedBy?: string;
      taskId?: string;
      teamId?: string;
      gameId?: string;
      kpiId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    return this.taskUpdateRepository.findByOrganizationId(
      organizationId,
      filters,
    );
  }
}
