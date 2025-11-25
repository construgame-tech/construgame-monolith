// Entidade de domínio: Game Kaizen Points
// Representa pontos totais de kaizen de um game

export interface GameKaizenPointsEntity {
  gameId: string;
  organizationId: string;
  projectId: string;
  points: number;
  sequence: number;
}

export const createGameKaizenPointsEntity = (
  props: Omit<GameKaizenPointsEntity, "sequence" | "points">,
): GameKaizenPointsEntity => {
  return {
    ...props,
    points: 0,
    sequence: 0,
  };
};

export const addPointsToGameKaizenPoints = (
  current: GameKaizenPointsEntity,
  pointsToAdd: number,
): GameKaizenPointsEntity => {
  return {
    ...current,
    points: current.points + pointsToAdd,
    sequence: current.sequence + 1,
  };
};
