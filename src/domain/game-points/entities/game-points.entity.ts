// Entidade de domínio: Game Points
// Representa pontos totais agregados de um game (task + kaizen)

export interface UserGamePointsEntity {
  userId: string;
  gameId: string;
  organizationId: string;
  projectId: string;
  taskPoints: number;
  kaizenPoints: number;
  totalPoints: number;
}

export interface TeamGamePointsEntity {
  teamId: string;
  gameId: string;
  organizationId: string;
  projectId: string;
  taskPoints: number;
  kaizenPoints: number;
  totalPoints: number;
}

export const createUserGamePointsEntity = (
  props: Omit<UserGamePointsEntity, "taskPoints" | "kaizenPoints" | "totalPoints">,
): UserGamePointsEntity => {
  return {
    ...props,
    taskPoints: 0,
    kaizenPoints: 0,
    totalPoints: 0,
  };
};

export const createTeamGamePointsEntity = (
  props: Omit<TeamGamePointsEntity, "taskPoints" | "kaizenPoints" | "totalPoints">,
): TeamGamePointsEntity => {
  return {
    ...props,
    taskPoints: 0,
    kaizenPoints: 0,
    totalPoints: 0,
  };
};

export const updateUserGamePoints = (
  current: UserGamePointsEntity,
  taskPoints: number,
  kaizenPoints: number,
): UserGamePointsEntity => {
  return {
    ...current,
    taskPoints,
    kaizenPoints,
    totalPoints: taskPoints + kaizenPoints,
  };
};

export const updateTeamGamePoints = (
  current: TeamGamePointsEntity,
  taskPoints: number,
  kaizenPoints: number,
): TeamGamePointsEntity => {
  return {
    ...current,
    taskPoints,
    kaizenPoints,
    totalPoints: taskPoints + kaizenPoints,
  };
};
