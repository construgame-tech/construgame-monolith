// Entidade de domínio: Prize
// Representa um prêmio disponível na organização

export interface PrizeEntity {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  icon?: string;
  photo?: string;
}

// Factory function para criar um novo prize
export const createPrizeEntity = (props: {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  icon?: string;
  photo?: string;
}): PrizeEntity => {
  return {
    id: props.id,
    organizationId: props.organizationId,
    name: props.name,
    description: props.description,
    icon: props.icon,
    photo: props.photo,
  };
};

// Factory function para atualizar um prize existente
export const updatePrizeEntity = (
  current: PrizeEntity,
  updates: {
    name?: string;
    description?: string;
    icon?: string;
    photo?: string;
  },
): PrizeEntity => {
  return {
    ...current,
    name: updates.name ?? current.name,
    description: updates.description ?? current.description,
    icon: updates.icon ?? current.icon,
    photo: updates.photo ?? current.photo,
  };
};
