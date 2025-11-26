// Entidade de domínio: User Kaizen Points
// Representa pontos de kaizen acumulados por um usuário

export interface UserKaizenPointsEntity {
  userId: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  points: number;
  sequence: number;
}

export const createUserKaizenPointsEntity = (
  props: Omit<UserKaizenPointsEntity, "sequence" | "points">,
): UserKaizenPointsEntity => {
  return {
    ...props,
    points: 0,
    sequence: 0,
  };
};

export const addPointsToUserKaizenPoints = (
  current: UserKaizenPointsEntity,
  pointsToAdd: number,
): UserKaizenPointsEntity => {
  return {
    ...current,
    points: current.points + pointsToAdd,
    sequence: current.sequence + 1,
  };
};
