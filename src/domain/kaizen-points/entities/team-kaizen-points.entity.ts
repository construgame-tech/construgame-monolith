// Entidade de domínio: Team Kaizen Points
// Representa pontos de kaizen acumulados por um time

export interface TeamKaizenPointsEntity {
  teamId: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  points: number;
}

export const createTeamKaizenPointsEntity = (
  props: Omit<TeamKaizenPointsEntity, "points">,
): TeamKaizenPointsEntity => {
  return {
    ...props,
    points: 0,
  };
};

export const addPointsToTeamKaizenPoints = (
  current: TeamKaizenPointsEntity,
  pointsToAdd: number,
): TeamKaizenPointsEntity => {
  return {
    ...current,
    points: current.points + pointsToAdd,
  };
};
