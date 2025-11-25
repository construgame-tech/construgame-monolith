import { randomUUID } from "node:crypto";
import {
  createKpiEntity,
  KpiEntity,
  updateKpiEntity,
} from "@domain/kpi/entities/kpi.entity";
import type { IKpiRepository } from "@domain/kpi/repositories/kpi.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

export interface CreateKpiInput {
  name: string;
  type: string;
  photo?: string;
}

export interface UpdateKpiInput {
  kpiId: string;
  name?: string;
  type?: string;
  photo?: string;
}

@Injectable()
export class KpiService {
  constructor(
    @Inject("IKpiRepository")
    private readonly kpiRepository: IKpiRepository,
  ) {}

  async createKpi(input: CreateKpiInput): Promise<KpiEntity> {
    const kpi = createKpiEntity({
      id: randomUUID(),
      name: input.name,
      type: input.type,
      photo: input.photo,
    });

    await this.kpiRepository.save(kpi);
    return kpi;
  }

  async getKpi(kpiId: string): Promise<KpiEntity> {
    const kpi = await this.kpiRepository.findById(kpiId);

    if (!kpi) {
      throw new NotFoundException(`KPI not found: ${kpiId}`);
    }

    return kpi;
  }

  async updateKpi(input: UpdateKpiInput): Promise<KpiEntity> {
    const currentKpi = await this.kpiRepository.findById(input.kpiId);

    if (!currentKpi) {
      throw new NotFoundException(`KPI not found: ${input.kpiId}`);
    }

    const updatedKpi = updateKpiEntity(currentKpi, {
      name: input.name,
      type: input.type,
      photo: input.photo,
    });

    await this.kpiRepository.save(updatedKpi);
    return updatedKpi;
  }

  async deleteKpi(kpiId: string): Promise<void> {
    const kpi = await this.kpiRepository.findById(kpiId);
    if (!kpi) {
      throw new NotFoundException(`KPI not found: ${kpiId}`);
    }
    await this.kpiRepository.delete(kpiId);
  }

  async listAll(): Promise<KpiEntity[]> {
    return this.kpiRepository.findAll();
  }
}
