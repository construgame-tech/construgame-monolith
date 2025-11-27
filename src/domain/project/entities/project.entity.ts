// Entidade de domínio: Project
// Representa um projeto com prêmios, equipes e localização

export type ProjectStatus = "ACTIVE" | "PAUSED" | "DONE";

export interface ProjectPrize {
  prizeId: string;
}

export interface ProjectEntity {
  id: string;
  organizationId: string;
  name: string;
  responsibles?: string[];
  status: ProjectStatus;
  activeGameId?: string;
  photo?: string;
  type?: string;
  state?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  prizes?: ProjectPrize[];
  teams?: string[];
}

// Factory function para criar um novo project com valores padrão
export const createProjectEntity = (props: {
  id: string;
  organizationId: string;
  name: string;
  responsibles?: string[];
  activeGameId?: string;
  photo?: string;
  type?: string;
  state?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  prizes?: ProjectPrize[];
  teams?: string[];
}): ProjectEntity => {
  return {
    id: props.id,
    organizationId: props.organizationId,
    name: props.name,
    responsibles: props.responsibles,
    status: "ACTIVE",
    activeGameId: props.activeGameId,
    photo: props.photo,
    type: props.type,
    state: props.state,
    city: props.city,
    startDate: props.startDate,
    endDate: props.endDate,
    prizes: props.prizes,
    teams: props.teams,
  };
};

// Factory function para atualizar um project existente
export const updateProjectEntity = (
  currentProject: ProjectEntity,
  updates: {
    name?: string;
    responsibles?: string[];
    status?: ProjectStatus;
    activeGameId?: string;
    photo?: string;
    type?: string;
    state?: string;
    city?: string;
    startDate?: string;
    endDate?: string;
    prizes?: ProjectPrize[];
    teams?: string[];
  },
): ProjectEntity => {
  return {
    ...currentProject,
    name: updates.name ?? currentProject.name,
    responsibles: updates.responsibles ?? currentProject.responsibles,
    status: updates.status ?? currentProject.status,
    activeGameId: updates.activeGameId ?? currentProject.activeGameId,
    photo: updates.photo ?? currentProject.photo,
    type: updates.type ?? currentProject.type,
    state: updates.state ?? currentProject.state,
    city: updates.city ?? currentProject.city,
    startDate: updates.startDate ?? currentProject.startDate,
    endDate: updates.endDate ?? currentProject.endDate,
    prizes: updates.prizes ?? currentProject.prizes,
    teams: updates.teams ?? currentProject.teams,
  };
};
