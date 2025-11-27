// Entidade de domínio: Macrostep
// Representa uma macro-etapa de planejamento de projeto

export interface MacrostepEntity {
  id: string;
  projectId: string;
  organizationId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface ActivityEntity {
  id: string;
  macrostepId: string;
  projectId: string;
  organizationId: string;
  name: string;
  description?: string;
  unityCost?: number;
  unityQuantity?: number;
  startDate?: string;
  endDate?: string;
}

export interface MacrostepOrderEntity {
  projectId: string;
  organizationId: string;
  macrostepIds: string[]; // Ordem dos macrosteps
}

export const createMacrostepEntity = (
  props: MacrostepEntity,
): MacrostepEntity => {
  return { ...props };
};

export const createActivityEntity = (
  props: ActivityEntity,
): ActivityEntity => {
  return { ...props };
};

export const createMacrostepOrderEntity = (
  props: MacrostepOrderEntity,
): MacrostepOrderEntity => {
  return { ...props };
};
