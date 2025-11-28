import { randomUUID } from "node:crypto";
import {
  createUserGamePointsEntity,
  createTeamGamePointsEntity,
} from "@domain/game-points/entities/game-points.entity";
import type { GameEntity } from "@domain/game/entities/game.entity";
import type { TaskEntity } from "@domain/task/entities/task.entity";
import {
  approveTaskUpdateEntity,
  cancelTaskUpdateEntity,
  createTaskUpdateEntity,
  rejectTaskUpdateEntity,
  TaskUpdateStatus,
} from "@domain/task-update/entities/task-update.entity";
import type {
  TeamGamePointsRepository,
  UserGamePointsRepository,
} from "@infrastructure/repositories/game-points.repository";
import { GameRepository } from "@infrastructure/repositories/game.repository";
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
    // Buscar a task para obter totalMeasurementExpected e calcular percent
    const task = await this.taskRepository.findById(dto.gameId, dto.taskId);
    
    // Calcular percent se não foi enviado mas temos absolute e totalMeasurementExpected
    let calculatedPercent = dto.progress.percent;
    if (
      calculatedPercent === undefined &&
      dto.progress.absolute !== undefined &&
      task?.totalMeasurementExpected
    ) {
      const total = Number(task.totalMeasurementExpected);
      if (total > 0) {
        calculatedPercent = Math.round((dto.progress.absolute / total) * 100);
      }
    }

    const entity = createTaskUpdateEntity({
      id: randomUUID(),
      gameId: dto.gameId,
      taskId: dto.taskId,
      submittedBy: dto.submittedBy,
      participants: dto.participants,
      photos: dto.photos,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      progress: {
        ...dto.progress,
        percent: calculatedPercent,
      },
      checklist: dto.checklist,
      files: dto.files,
    });

    return this.taskUpdateRepository.save(entity);
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
    
    // Se já está aprovado, não reprocessar
    if (current.status === "APPROVED") {
      return current;
    }
    
    // Buscar a Task para calcular o percent
    const task = await this.taskRepository.findById(current.gameId, current.taskId);
    
    // Buscar o Game para obter organizationId e projectId
    const game = await this.gameRepository.findByIdOnly(current.gameId);
    
    // Calcular percent se temos progressAbsolute e totalMeasurementExpected
    let calculatedPercent = current.progress.percent;
    const progressAbsolute = dto.progressAbsolute ?? current.progress.absolute;
    
    if (progressAbsolute !== undefined && task?.totalMeasurementExpected) {
      const total = Number(task.totalMeasurementExpected);
      if (total > 0) {
        calculatedPercent = Math.round((progressAbsolute / total) * 100);
      }
    }
    
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
    const savedUpdate = await this.taskUpdateRepository.save(updatedWithPercent);
    
    // Atualiza o progresso da Task
    await this.updateTaskProgress(current.gameId, current.taskId, updatedWithPercent);
    
    // Creditar pontos aos participantes e times
    if (task && game) {
      const participants = dto.participants ?? current.participants ?? [];
      // Se não houver participantes definidos, credita ao submitter
      const pointRecipients = participants.length > 0 ? participants : [current.submittedBy];
      
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
   * Os pontos são creditados aos participantes e ao time (se aplicável).
   */
  private async creditTaskPoints(params: {
    task: TaskEntity;
    game: GameEntity;
    progressPercent: number;
    participants: string[];
  }) {
    const { task, game, progressPercent, participants } = params;
    
    // Calcular pontos proporcionais ao progresso deste update
    const pointsToCredit = Math.round((progressPercent / 100) * task.rewardPoints);
    
    if (pointsToCredit <= 0) return;
    
    // 1. Creditar pontos a cada participante
    for (const userId of participants) {
      const current = await this.userGamePointsRepository.findByUserAndGame(userId, game.id);
      
      const userPoints = current ?? createUserGamePointsEntity({
        userId,
        gameId: game.id,
        organizationId: game.organizationId,
        projectId: game.projectId,
      });
      
      // Adicionar os pontos
      const updated = {
        ...userPoints,
        taskPoints: userPoints.taskPoints + pointsToCredit,
        totalPoints: userPoints.taskPoints + pointsToCredit + userPoints.kaizenPoints,
      };
      
      await this.userGamePointsRepository.save(updated);
    }
    
    // 2. Creditar pontos ao time (se a task pertence a um time)
    if (task.teamId) {
      const currentTeam = await this.teamGamePointsRepository.findByTeamAndGame(task.teamId, game.id);
      
      const teamPoints = currentTeam ?? createTeamGamePointsEntity({
        teamId: task.teamId,
        gameId: game.id,
        organizationId: game.organizationId,
        projectId: game.projectId,
      });
      
      // Adicionar os pontos
      const updatedTeam = {
        ...teamPoints,
        taskPoints: teamPoints.taskPoints + pointsToCredit,
        totalPoints: teamPoints.taskPoints + pointsToCredit + teamPoints.kaizenPoints,
      };
      
      await this.teamGamePointsRepository.save(updatedTeam);
    }
  }
  
  /**
   * Atualiza o progresso da Task quando um task-update é aprovado.
   * Adiciona o update à lista de updates da task e recalcula o progresso.
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
    const filteredUpdates = existingUpdates.filter((u) => u.id !== approvedUpdate.id);
    const updatedUpdates = [...filteredUpdates, taskUpdate];
    
    // Calcula o novo progresso baseado em todos os updates aprovados
    const totalAbsolute = updatedUpdates.reduce((sum, u) => sum + (u.progress || 0), 0);
    const totalMeasurementExpected = Number(task.totalMeasurementExpected) || 0;
    
    let newPercent = 0;
    if (totalMeasurementExpected > 0) {
      newPercent = Math.min(Math.round((totalAbsolute / totalMeasurementExpected) * 100), 100);
    } else if (updatedUpdates.length > 0) {
      // Se não há meta quantitativa, qualquer update aprovado pode ser 100%
      newPercent = 100;
    }
    
    // Atualiza a task com o novo progresso
    const updatedTask = {
      ...task,
      updates: updatedUpdates,
      progress: {
        absolute: totalAbsolute,
        percent: newPercent,
        updatedAt: new Date().toISOString(),
      },
      status: newPercent >= 100 ? ("completed" as const) : ("active" as const),
    };
    
    await this.taskRepository.save(updatedTask);
  }

  async reject(id: string, dto: RejectTaskUpdateDto) {
    const current = await this.findById(id);
    const updated = rejectTaskUpdateEntity(current, {
      reviwedBy: dto.reviewedBy || "",
      reviewNote: dto.reviewNote,
    });
    return this.taskUpdateRepository.save(updated);
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
    const updatedUpdates = (task.updates || []).filter((u) => u.id !== updateId);
    
    // Recalcula o progresso
    const totalAbsolute = updatedUpdates.reduce((sum, u) => sum + (u.progress || 0), 0);
    const totalMeasurementExpected = Number(task.totalMeasurementExpected) || 0;
    
    let newPercent = 0;
    if (totalMeasurementExpected > 0) {
      newPercent = Math.min(Math.round((totalAbsolute / totalMeasurementExpected) * 100), 100);
    } else if (updatedUpdates.length > 0) {
      newPercent = 100;
    }
    
    const updatedTask = {
      ...task,
      updates: updatedUpdates,
      progress: {
        absolute: totalAbsolute,
        percent: newPercent,
        updatedAt: new Date().toISOString(),
      },
      status: newPercent >= 100 ? ("completed" as const) : ("active" as const),
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
