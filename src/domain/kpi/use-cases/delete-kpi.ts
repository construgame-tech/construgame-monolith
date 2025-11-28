// Use Case: Remover um KPI
import type { IKpiRepository } from "../repositories/kpi.repository.interface";

export interface DeleteKpiInput {
  kpiId: string;
}

export const deleteKpi = async (
  input: DeleteKpiInput,
  repository: IKpiRepository,
): Promise<void> => {
  const kpi = await repository.findById(input.kpiId);

  if (!kpi) {
    throw new Error(`KPI not found: ${input.kpiId}`);
  }

  await repository.delete(input.kpiId);
};
