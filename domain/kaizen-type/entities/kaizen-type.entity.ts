// Entidade de domínio: Kaizen Type
// Representa um tipo/categoria de kaizen

export interface KaizenTypeEntity {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  points: number;
  ideaPoints?: number;
  ideaExecutionPoints?: number;
  sequence: number;
}

export const createKaizenTypeEntity = (
  props: Omit<KaizenTypeEntity, "sequence">,
): KaizenTypeEntity => {
  return {
    ...props,
    sequence: 0,
  };
};

export const updateKaizenTypeEntity = (
  current: KaizenTypeEntity,
  updates: Partial<
    Omit<KaizenTypeEntity, "id" | "organizationId" | "sequence">
  >,
): KaizenTypeEntity => {
  return {
    ...current,
    ...updates,
    sequence: current.sequence + 1,
  };
};
