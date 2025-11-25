// Entidade de domínio: Sector
// Representa um setor dentro da organização

export interface SectorEntity {
  id: string;
  organizationId: string;
  name: string;
}

// Factory function para criar um novo sector
export const createSectorEntity = (props: {
  id: string;
  organizationId: string;
  name: string;
}): SectorEntity => {
  return {
    id: props.id,
    organizationId: props.organizationId,
    name: props.name,
  };
};

// Factory function para atualizar um sector existente
export const updateSectorEntity = (
  current: SectorEntity,
  updates: {
    name?: string;
  },
): SectorEntity => {
  return {
    ...current,
    name: updates.name ?? current.name,
  };
};
