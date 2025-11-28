import {
  createTaskTemplate,
  updateTaskTemplate,
  getTaskTemplate,
  deleteTaskTemplate,
  listOrganizationTaskTemplates,
} from "@domain/task-template";
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

  async create(organizationId: string, dto: CreateTaskTemplateDto) {
    const { template } = await createTaskTemplate(
      {
        organizationId,
        kpiId: dto.kpiId,
        name: dto.name,
        rewardPoints: dto.rewardPoints,
        description: dto.description,
        measurementUnit: dto.measurementUnit,
        totalMeasurementExpected: dto.totalMeasurementExpected,
      },
      this.taskTemplateRepository,
    );

    return template;
  }

  async findById(id: string) {
    try {
      const { template } = await getTaskTemplate(
        { templateId: id },
        this.taskTemplateRepository,
      );
      return template;
    } catch {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }
  }

  async findByOrganizationId(organizationId: string) {
    const { templates } = await listOrganizationTaskTemplates(
      { organizationId },
      this.taskTemplateRepository,
    );
    return templates;
  }

  async update(id: string, dto: UpdateTaskTemplateDto) {
    try {
      const { template } = await updateTaskTemplate(
        {
          templateId: id,
          kpiId: dto.kpiId,
          name: dto.name,
          rewardPoints: dto.rewardPoints,
          description: dto.description,
          measurementUnit: dto.measurementUnit,
          totalMeasurementExpected: dto.totalMeasurementExpected,
        },
        this.taskTemplateRepository,
      );
      return template;
    } catch {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }
  }

  async delete(id: string) {
    try {
      await deleteTaskTemplate(
        { templateId: id },
        this.taskTemplateRepository,
      );
    } catch {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }
  }
}
