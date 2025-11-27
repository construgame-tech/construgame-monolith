// Entidade de domínio: User Task Points
// Representa pontos de tarefas acumulados por um usuário

export interface UserTaskPointsEntity {
  userId: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  points: number;
}

export const createUserTaskPointsEntity = (
  props: Omit<UserTaskPointsEntity, "points">,
): UserTaskPointsEntity => {
  return {
    ...props,
    points: 0,
  };
};

export const addPointsToUserTaskPoints = (
  current: UserTaskPointsEntity,
  pointsToAdd: number,
): UserTaskPointsEntity => {
  return {
    ...current,
    points: current.points + pointsToAdd,
  };
};
