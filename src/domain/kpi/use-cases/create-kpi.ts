// Use Case: Criar um novo KPI
import { randomUUID } from "node:crypto";
import { createKpiEntity, KpiEntity } from "../entities/kpi.entity";
import type { IKpiRepository } from "../repositories/kpi.repository.interface";

export interface CreateKpiInput {
  name: string;
  type: string;
  photo?: string;
}

export interface CreateKpiOutput {
  kpi: KpiEntity;
}

export const createKpi = async (
  input: CreateKpiInput,
  repository: IKpiRepository,
): Promise<CreateKpiOutput> => {
  const kpi = createKpiEntity({
    id: randomUUID(),
    name: input.name,
    type: input.type,
    photo: input.photo,
  });

  await repository.save(kpi);

  return { kpi };
};
