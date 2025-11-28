// Use Case: Listar todos os KPIs
import type { KpiEntity } from "../entities/kpi.entity";
import type { IKpiRepository } from "../repositories/kpi.repository.interface";

export interface ListKpisOutput {
  kpis: KpiEntity[];
}

export const listKpis = async (
  repository: IKpiRepository,
): Promise<ListKpisOutput> => {
  const kpis = await repository.findAll();

  return { kpis };
};
