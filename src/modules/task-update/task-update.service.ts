import { randomUUID } from "node:crypto";
import {
  approveTaskUpdateEntity,
  cancelTaskUpdateEntity,
  createTaskUpdateEntity,
  rejectTaskUpdateEntity,
  TaskUpdateStatus,
} from "@domain/task-update/entities/task-update.entity";
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
  ) {}

  async create(dto: CreateTaskUpdateDto) {
    const entity = createTaskUpdateEntity({
      id: randomUUID(),
      gameId: dto.gameId,
      taskId: dto.taskId,
      submittedBy: dto.submittedBy,
      participants: dto.participants,
      photos: dto.photos,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      progress: dto.progress,
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
    const updated = approveTaskUpdateEntity(current, {
      reviwedBy: dto.reviewedBy,
      reviewNote: dto.reviewNote,
      progressAbsolute: dto.progressAbsolute,
      participants: dto.participants,
      checklist: dto.checklist,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
    return this.taskUpdateRepository.save(updated);
  }

  async reject(id: string, dto: RejectTaskUpdateDto) {
    const current = await this.findById(id);
    const updated = rejectTaskUpdateEntity(current, {
      reviwedBy: dto.reviewedBy,
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
    const updated = cancelTaskUpdateEntity(current);
    return this.taskUpdateRepository.save(updated);
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
