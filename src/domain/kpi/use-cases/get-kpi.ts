// Use Case: Buscar um KPI por ID
import type { KpiEntity } from "../entities/kpi.entity";
import type { IKpiRepository } from "../repositories/kpi.repository.interface";

export interface GetKpiInput {
  kpiId: string;
}

export interface GetKpiOutput {
  kpi: KpiEntity;
}

export const getKpi = async (
  input: GetKpiInput,
  repository: IKpiRepository,
): Promise<GetKpiOutput> => {
  const kpi = await repository.findById(input.kpiId);

  if (!kpi) {
    throw new Error(`KPI not found: ${input.kpiId}`);
  }

  return { kpi };
};
