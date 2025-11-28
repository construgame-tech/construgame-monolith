// Use Case: Atualizar um KPI existente
import { KpiEntity, updateKpiEntity } from "../entities/kpi.entity";
import type { IKpiRepository } from "../repositories/kpi.repository.interface";

export interface UpdateKpiInput {
  kpiId: string;
  name?: string;
  type?: string;
  photo?: string;
}

export interface UpdateKpiOutput {
  kpi: KpiEntity;
}

export const updateKpi = async (
  input: UpdateKpiInput,
  repository: IKpiRepository,
): Promise<UpdateKpiOutput> => {
  const currentKpi = await repository.findById(input.kpiId);

  if (!currentKpi) {
    throw new Error(`KPI not found: ${input.kpiId}`);
  }

  const updatedKpi = updateKpiEntity(currentKpi, {
    name: input.name,
    type: input.type,
    photo: input.photo,
  });

  await repository.save(updatedKpi);

  return { kpi: updatedKpi };
};
