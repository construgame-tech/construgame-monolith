// Entidade de domínio: TaskTemplate
// Representa um template de tarefa reutilizável

export interface TaskTemplateEntity {
  id: string;
  organizationId: string;
  kpiId: string;
  name: string;
  rewardPoints: number;
  description?: string;
  measurementUnit?: string;
  totalMeasurementExpected?: string;
}

// Factory function para criar um novo task template
export const createTaskTemplateEntity = (props: {
  id: string;
  organizationId: string;
  kpiId: string;
  name: string;
  rewardPoints: number;
  description?: string;
  measurementUnit?: string;
  totalMeasurementExpected?: string;
}): TaskTemplateEntity => {
  return {
    id: props.id,
    organizationId: props.organizationId,
    kpiId: props.kpiId,
    name: props.name,
    rewardPoints: props.rewardPoints,
    description: props.description,
    measurementUnit: props.measurementUnit,
    totalMeasurementExpected: props.totalMeasurementExpected,
  };
};

// Factory function para atualizar um task template existente
export const updateTaskTemplateEntity = (
  current: TaskTemplateEntity,
  updates: {
    kpiId?: string;
    name?: string;
    rewardPoints?: number;
    description?: string;
    measurementUnit?: string;
    totalMeasurementExpected?: string;
  },
): TaskTemplateEntity => {
  return {
    ...current,
    kpiId: updates.kpiId ?? current.kpiId,
    name: updates.name ?? current.name,
    rewardPoints: updates.rewardPoints ?? current.rewardPoints,
    description: updates.description ?? current.description,
    measurementUnit: updates.measurementUnit ?? current.measurementUnit,
    totalMeasurementExpected:
      updates.totalMeasurementExpected ?? current.totalMeasurementExpected,
  };
};
