// Interface do repositório de KPI
// Define o contrato para persistência, sem implementação
// A implementação real será feita na camada de infraestrutura (DynamoDB, Postgres + Drizzle, etc)

import { KpiEntity } from "../entities/kpi.entity";

export interface IKpiRepository {
  // Persiste um KPI (create ou update)
  save(kpi: KpiEntity): Promise<void>;

  // Remove um KPI
  delete(kpiId: string): Promise<void>;

  // Busca um KPI por ID
  findById(kpiId: string): Promise<KpiEntity | null>;

  // Lista todos os KPIs
  findAll(): Promise<KpiEntity[]>;
}
