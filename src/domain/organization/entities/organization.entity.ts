// Entidade de domínio: Organization
// Representa uma organização que contém projetos e jogos

export interface OrganizationEntity {
  id: string;
  ownerId: string;
  name: string;
  photo?: string;
}

// Factory function para criar uma nova organization com valores padrão
export const createOrganizationEntity = (props: {
  id: string;
  ownerId: string;
  name: string;
  photo?: string;
}): OrganizationEntity => {
  return {
    id: props.id,
    ownerId: props.ownerId,
    name: props.name,
    photo: props.photo,
  };
};

// Factory function para atualizar uma organization existente
export const updateOrganizationEntity = (
  currentOrganization: OrganizationEntity,
  updates: {
    name?: string;
    photo?: string;
  },
): OrganizationEntity => {
  return {
    ...currentOrganization,
    name: updates.name ?? currentOrganization.name,
    photo: updates.photo ?? currentOrganization.photo,
  };
};
