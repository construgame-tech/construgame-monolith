// Entidade de domínio: User Task Points
// Representa pontos de tarefas acumulados por um usuário

export interface UserTaskPointsEntity {
  userId: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  points: number;
  sequence: number;
}

export const createUserTaskPointsEntity = (
  props: Omit<UserTaskPointsEntity, "sequence" | "points">,
): UserTaskPointsEntity => {
  return {
    ...props,
    points: 0,
    sequence: 0,
  };
};

export const addPointsToUserTaskPoints = (
  current: UserTaskPointsEntity,
  pointsToAdd: number,
): UserTaskPointsEntity => {
  return {
    ...current,
    points: current.points + pointsToAdd,
    sequence: current.sequence + 1,
  };
};
