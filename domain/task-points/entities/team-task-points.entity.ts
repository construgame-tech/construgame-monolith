// Entidade de domínio: Team Task Points
// Representa pontos de tarefas acumulados por um time

export interface TeamTaskPointsEntity {
  teamId: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  points: number;
  sequence: number;
}

export const createTeamTaskPointsEntity = (
  props: Omit<TeamTaskPointsEntity, "sequence" | "points">,
): TeamTaskPointsEntity => {
  return {
    ...props,
    points: 0,
    sequence: 0,
  };
};

export const addPointsToTeamTaskPoints = (
  current: TeamTaskPointsEntity,
  pointsToAdd: number,
): TeamTaskPointsEntity => {
  return {
    ...current,
    points: current.points + pointsToAdd,
    sequence: current.sequence + 1,
  };
};
