// Interface do repositório de Task Template
import type { TaskTemplateEntity } from "../entities/task-template.entity";

export interface ITaskTemplateRepository {
  save(template: TaskTemplateEntity): Promise<TaskTemplateEntity>;
  findById(id: string): Promise<TaskTemplateEntity | null>;
  findByOrganizationId(organizationId: string): Promise<TaskTemplateEntity[]>;
  delete(id: string): Promise<void>;
}
