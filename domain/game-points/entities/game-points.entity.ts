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
  sequence: number;
}

export interface TeamGamePointsEntity {
  teamId: string;
  gameId: string;
  organizationId: string;
  projectId: string;
  taskPoints: number;
  kaizenPoints: number;
  totalPoints: number;
  sequence: number;
}

export const createUserGamePointsEntity = (
  props: Omit<
    UserGamePointsEntity,
    "sequence" | "taskPoints" | "kaizenPoints" | "totalPoints"
  >,
): UserGamePointsEntity => {
  return {
    ...props,
    taskPoints: 0,
    kaizenPoints: 0,
    totalPoints: 0,
    sequence: 0,
  };
};

export const createTeamGamePointsEntity = (
  props: Omit<
    TeamGamePointsEntity,
    "sequence" | "taskPoints" | "kaizenPoints" | "totalPoints"
  >,
): TeamGamePointsEntity => {
  return {
    ...props,
    taskPoints: 0,
    kaizenPoints: 0,
    totalPoints: 0,
    sequence: 0,
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
    sequence: current.sequence + 1,
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
    sequence: current.sequence + 1,
  };
};
