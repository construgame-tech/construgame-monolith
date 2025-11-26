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
  sequence: number;
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
  sequence: number;
}

export interface MacrostepOrderEntity {
  projectId: string;
  organizationId: string;
  macrostepIds: string[]; // Ordem dos macrosteps
  sequence: number;
}

export const createMacrostepEntity = (
  props: Omit<MacrostepEntity, "sequence">,
): MacrostepEntity => {
  return { ...props, sequence: 0 };
};

export const createActivityEntity = (
  props: Omit<ActivityEntity, "sequence">,
): ActivityEntity => {
  return { ...props, sequence: 0 };
};

export const createMacrostepOrderEntity = (
  props: Omit<MacrostepOrderEntity, "sequence">,
): MacrostepOrderEntity => {
  return { ...props, sequence: 0 };
};
