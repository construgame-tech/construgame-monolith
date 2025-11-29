// Repositório de Checklist Templates Reutilizáveis
// Implementa a interface IChecklistTemplateRepository do domínio

import type {
  ChecklistTemplateEntity,
  IChecklistTemplateRepository,
} from "@domain/task-template";
import { reusableChecklistTemplates } from "@infrastructure/database/schemas/task-template.schema";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  DRIZZLE_CONNECTION,
  type DrizzleDB,
} from "../database/drizzle.provider";

@Injectable()
export class ChecklistTemplateRepository
  implements IChecklistTemplateRepository
{
  constructor(@Inject(DRIZZLE_CONNECTION) private readonly db: DrizzleDB) {}

  async save(template: ChecklistTemplateEntity): Promise<void> {
    await this.db
      .insert(reusableChecklistTemplates)
      .values({
        id: template.id,
        organizationId: template.organizationId,
        name: template.name,
        checklist: template.checklist,
      })
      .onConflictDoUpdate({
        target: reusableChecklistTemplates.id,
        set: {
          name: template.name,
          checklist: template.checklist,
        },
      });
  }

  async findById(id: string): Promise<ChecklistTemplateEntity | null> {
    const result = await this.db
      .select()
      .from(reusableChecklistTemplates)
      .where(eq(reusableChecklistTemplates.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      checklist: row.checklist,
    };
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<ChecklistTemplateEntity[]> {
    const result = await this.db
      .select()
      .from(reusableChecklistTemplates)
      .where(eq(reusableChecklistTemplates.organizationId, organizationId));

    return result.map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      checklist: row.checklist,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(reusableChecklistTemplates)
      .where(eq(reusableChecklistTemplates.id, id));
  }
}
