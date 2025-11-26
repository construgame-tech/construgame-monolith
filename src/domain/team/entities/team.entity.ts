// Entidade de domínio: Team
// Representa uma equipe dentro de uma organização

export interface TeamEntity {
  id: string;
  organizationId: string;
  name: string;
  managerId?: string;
  fieldOfAction?: string;
  members?: string[];
  sequence: number;
  photo?: string;
  color?: string;
  description?: string;
}

// Factory function para criar um novo team com valores padrão
export const createTeamEntity = (props: {
  id: string;
  organizationId: string;
  name: string;
  managerId?: string;
  fieldOfAction?: string;
  members?: string[];
  photo?: string;
  color?: string;
  description?: string;
}): TeamEntity => {
  return {
    id: props.id,
    organizationId: props.organizationId,
    name: props.name,
    managerId: props.managerId,
    fieldOfAction: props.fieldOfAction,
    members: props.members,
    photo: props.photo,
    color: props.color,
    description: props.description,
    sequence: 0,
  };
};

// Factory function para atualizar um team existente
export const updateTeamEntity = (
  currentTeam: TeamEntity,
  updates: {
    name?: string;
    managerId?: string;
    fieldOfAction?: string;
    members?: string[];
    photo?: string;
    color?: string;
    description?: string;
  },
): TeamEntity => {
  return {
    ...currentTeam,
    name: updates.name ?? currentTeam.name,
    managerId: updates.managerId ?? currentTeam.managerId,
    fieldOfAction: updates.fieldOfAction ?? currentTeam.fieldOfAction,
    members: updates.members ?? currentTeam.members,
    photo: updates.photo ?? currentTeam.photo,
    color: updates.color ?? currentTeam.color,
    description: updates.description ?? currentTeam.description,
    sequence: currentTeam.sequence + 1,
  };
};

// Incrementa a sequence para deleção
export const incrementTeamSequence = (team: TeamEntity): TeamEntity => {
  return {
    ...team,
    sequence: team.sequence + 1,
  };
};
