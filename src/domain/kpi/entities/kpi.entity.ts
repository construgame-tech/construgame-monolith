// Entidade de domínio: KPI
// Representa um indicador chave de performance (Key Performance Indicator)

export interface KpiEntity {
  id: string;
  name: string;
  type: string;
  kpiType?: string;
  photo?: string;
}

// Factory function para criar um novo KPI com valores padrão
export const createKpiEntity = (props: {
  id: string;
  name: string;
  type: string;
  kpiType?: string;
  photo?: string;
}): KpiEntity => {
  return {
    id: props.id,
    name: props.name,
    type: props.type,
    kpiType: props.kpiType,
    photo: props.photo,
  };
};

// Factory function para atualizar um KPI existente
export const updateKpiEntity = (
  currentKpi: KpiEntity,
  updates: {
    name?: string;
    type?: string;
    kpiType?: string;
    photo?: string;
  },
): KpiEntity => {
  return {
    ...currentKpi,
    name: updates.name ?? currentKpi.name,
    type: updates.type ?? currentKpi.type,
    kpiType: updates.kpiType ?? currentKpi.kpiType,
    photo: updates.photo ?? currentKpi.photo,
  };
};
