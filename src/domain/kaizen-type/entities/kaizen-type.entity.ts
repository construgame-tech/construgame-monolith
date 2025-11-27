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
}

export const createKaizenTypeEntity = (
  props: KaizenTypeEntity,
): KaizenTypeEntity => {
  return {
    ...props,
  };
};

export const updateKaizenTypeEntity = (
  current: KaizenTypeEntity,
  updates: Partial<
    Omit<KaizenTypeEntity, "id" | "organizationId">
  >,
): KaizenTypeEntity => {
  return {
    ...current,
    ...updates,
  };
};
