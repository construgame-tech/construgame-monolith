// Entidade de domínio: League
// Representa uma liga competitiva entre projetos/games

export type LeagueStatus = "ACTIVE" | "ARCHIVED" | "DONE" | "PAUSED";

export interface LeaguePrize {
  prizeId: string;
}

export interface LeagueEntity {
  id: string;
  organizationId: string;
  responsibleId: string;
  status: LeagueStatus;
  name: string;
  photo?: string;
  objective?: string;
  startDate?: string;
  endDate?: string;
  prizes?: LeaguePrize[];
  projects?: string[];
  games?: string[];
  hidden?: boolean;
}

// Factory function para criar uma nova league
export const createLeagueEntity = (props: {
  id: string;
  organizationId: string;
  responsibleId: string;
  name: string;
  photo?: string;
  objective?: string;
  startDate?: string;
  endDate?: string;
  prizes?: LeaguePrize[];
  projects?: string[];
  games?: string[];
  hidden?: boolean;
}): LeagueEntity => {
  return {
    id: props.id,
    organizationId: props.organizationId,
    responsibleId: props.responsibleId,
    status: "ACTIVE",
    name: props.name,
    photo: props.photo,
    objective: props.objective,
    startDate: props.startDate,
    endDate: props.endDate,
    prizes: props.prizes,
    projects: props.projects,
    games: props.games,
    hidden: props.hidden ?? false,
  };
};

// Factory function para atualizar uma league
export const updateLeagueEntity = (
  currentLeague: LeagueEntity,
  updates: {
    status?: LeagueStatus;
    name?: string;
    photo?: string;
    objective?: string;
    startDate?: string;
    endDate?: string;
    prizes?: LeaguePrize[];
    projects?: string[];
    games?: string[];
    hidden?: boolean;
    responsibleId?: string;
  },
): LeagueEntity => {
  return {
    ...currentLeague,
    status: updates.status ?? currentLeague.status,
    name: updates.name ?? currentLeague.name,
    photo: updates.photo ?? currentLeague.photo,
    objective: updates.objective ?? currentLeague.objective,
    startDate: updates.startDate ?? currentLeague.startDate,
    endDate: updates.endDate ?? currentLeague.endDate,
    prizes: updates.prizes ?? currentLeague.prizes,
    projects: updates.projects ?? currentLeague.projects,
    games: updates.games ?? currentLeague.games,
    hidden: updates.hidden ?? currentLeague.hidden,
    responsibleId: updates.responsibleId ?? currentLeague.responsibleId,
  };
};
