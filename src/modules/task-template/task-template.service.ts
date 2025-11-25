import { randomUUID } from "node:crypto";
import {
  createTaskTemplateEntity,
  updateTaskTemplateEntity,
} from "@domain/task-template/entities/task-template.entity";
import { TaskTemplateRepository } from "@infrastructure/repositories/task-template.repository";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateTaskTemplateDto } from "./dto/create-task-template.dto";
import { UpdateTaskTemplateDto } from "./dto/update-task-template.dto";

@Injectable()
export class TaskTemplateService {
  constructor(
    @Inject("TaskTemplateRepository")
    private readonly taskTemplateRepository: TaskTemplateRepository,
  ) {}

  async create(dto: CreateTaskTemplateDto) {
    const entity = createTaskTemplateEntity({
      id: randomUUID(),
      organizationId: dto.organizationId,
      kpiId: dto.kpiId,
      name: dto.name,
      rewardPoints: dto.rewardPoints,
      description: dto.description,
      measurementUnit: dto.measurementUnit,
      totalMeasurementExpected: dto.totalMeasurementExpected,
    });

    return this.taskTemplateRepository.save(entity);
  }

  async findById(id: string) {
    const template = await this.taskTemplateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }
    return template;
  }

  async findByOrganizationId(organizationId: string) {
    return this.taskTemplateRepository.findByOrganizationId(organizationId);
  }

  async update(id: string, dto: UpdateTaskTemplateDto) {
    const current = await this.findById(id);
    const updated = updateTaskTemplateEntity(current, dto);
    return this.taskTemplateRepository.save(updated);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.taskTemplateRepository.delete(id);
  }
}
