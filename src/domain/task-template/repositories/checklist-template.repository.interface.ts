// Interface do repositório de Checklist Template
// Define o contrato que a camada de infraestrutura deve implementar
import type { ChecklistTemplateEntity } from "../entities/checklist-template.entity";

export interface IChecklistTemplateRepository {
  save(template: ChecklistTemplateEntity): Promise<void>;
  findById(id: string): Promise<ChecklistTemplateEntity | null>;
  findByOrganizationId(
    organizationId: string,
  ): Promise<ChecklistTemplateEntity[]>;
  delete(id: string): Promise<void>;
}
