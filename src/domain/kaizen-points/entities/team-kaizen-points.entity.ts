// Entidade de domínio: Team Kaizen Points
// Representa pontos de kaizen acumulados por um time

export interface TeamKaizenPointsEntity {
  teamId: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  points: number;
  sequence: number;
}

export const createTeamKaizenPointsEntity = (
  props: Omit<TeamKaizenPointsEntity, "sequence" | "points">,
): TeamKaizenPointsEntity => {
  return {
    ...props,
    points: 0,
    sequence: 0,
  };
};

export const addPointsToTeamKaizenPoints = (
  current: TeamKaizenPointsEntity,
  pointsToAdd: number,
): TeamKaizenPointsEntity => {
  return {
    ...current,
    points: current.points + pointsToAdd,
    sequence: current.sequence + 1,
  };
};
