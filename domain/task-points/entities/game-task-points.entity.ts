// Entidade de domínio: Game Task Points
// Representa pontos totais de tarefas de um game

export interface GameTaskPointsEntity {
  gameId: string;
  organizationId: string;
  projectId: string;
  points: number;
  sequence: number;
}

export const createGameTaskPointsEntity = (
  props: Omit<GameTaskPointsEntity, "sequence" | "points">,
): GameTaskPointsEntity => {
  return {
    ...props,
    points: 0,
    sequence: 0,
  };
};

export const addPointsToGameTaskPoints = (
  current: GameTaskPointsEntity,
  pointsToAdd: number,
): GameTaskPointsEntity => {
  return {
    ...current,
    points: current.points + pointsToAdd,
    sequence: current.sequence + 1,
  };
};
