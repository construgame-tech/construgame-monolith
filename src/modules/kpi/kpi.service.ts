import {
  CreateKpiInput,
  createKpi,
  deleteKpi,
  getKpi,
  KpiEntity,
  listKpis,
  UpdateKpiInput,
  updateKpi,
} from "@domain/kpi";
import type { IKpiRepository } from "@domain/kpi/repositories/kpi.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

// UUID padrão para KPIs globais (sem organização específica)
const GLOBAL_KPI_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000000";

@Injectable()
export class KpiService {
  constructor(
    @Inject("IKpiRepository")
    private readonly kpiRepository: IKpiRepository,
  ) {}

  async createKpi(
    input: Omit<CreateKpiInput, "organizationId"> & { organizationId?: string },
  ): Promise<KpiEntity> {
    const result = await createKpi(
      {
        ...input,
        organizationId: input.organizationId ?? GLOBAL_KPI_ORGANIZATION_ID,
      },
      this.kpiRepository,
    );
    return result.kpi;
  }

  async getKpi(kpiId: string): Promise<KpiEntity> {
    try {
      const result = await getKpi({ kpiId }, this.kpiRepository);
      return result.kpi;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`KPI not found: ${kpiId}`);
      }
      throw error;
    }
  }

  async updateKpi(input: UpdateKpiInput): Promise<KpiEntity> {
    try {
      const result = await updateKpi(input, this.kpiRepository);
      return result.kpi;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`KPI not found: ${input.kpiId}`);
      }
      throw error;
    }
  }

  async deleteKpi(kpiId: string): Promise<void> {
    try {
      await deleteKpi({ kpiId }, this.kpiRepository);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`KPI not found: ${kpiId}`);
      }
      throw error;
    }
  }

  async listAll(): Promise<KpiEntity[]> {
    const result = await listKpis(this.kpiRepository);
    return result.kpis;
  }
}
