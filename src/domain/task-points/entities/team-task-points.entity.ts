// Entidade de domínio: Team Task Points
// Representa pontos de tarefas acumulados por um time

export interface TeamTaskPointsEntity {
  teamId: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  points: number;
}

export const createTeamTaskPointsEntity = (
  props: Omit<TeamTaskPointsEntity, "points">,
): TeamTaskPointsEntity => {
  return {
    ...props,
    points: 0,
  };
};

export const addPointsToTeamTaskPoints = (
  current: TeamTaskPointsEntity,
  pointsToAdd: number,
): TeamTaskPointsEntity => {
  return {
    ...current,
    points: current.points + pointsToAdd,
  };
};
