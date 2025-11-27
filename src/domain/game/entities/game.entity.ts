// Entidade de domínio: Game
// Representa um jogo/competição com prêmios, KPIs e gamificação

export type GameStatus = "ACTIVE" | "PAUSED" | "DONE";

export type GameRankingType = "player" | "team";

export type GamePrizeType = "points" | "placement";

export interface GamePrize {
  prizeId: string;
  rankingType?: GameRankingType;
  type?: GamePrizeType;
  value?: number;
}

export interface GameKpi {
  id: string;
  points: number;
}

export interface GameEntity {
  id: string;
  organizationId: string;
  projectId: string;
  status: GameStatus;
  name: string;
  photo?: string;
  objective?: string;
  updateFrequency?: number;
  managerId?: string;
  responsibles?: string[];
  startDate?: string;
  endDate?: string;
  prizes?: GamePrize[];
  kpis?: GameKpi[];
  archived?: boolean;
  gameManagerId?: string;
}

// Factory function para criar um novo game com valores padrão
export const createGameEntity = (props: {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  gameManagerId?: string;
  photo?: string;
  startDate?: string;
  endDate?: string;
  managerId?: string;
  responsibles?: string[];
  objective?: string;
  prizes?: GamePrize[];
  kpis?: GameKpi[];
  updateFrequency?: number;
}): GameEntity => {
  return {
    id: props.id,
    organizationId: props.organizationId,
    projectId: props.projectId,
    gameManagerId: props.gameManagerId,
    name: props.name,
    status: "ACTIVE",
    photo: props.photo,
    endDate: props.endDate,
    managerId: props.managerId,
    responsibles: props.responsibles,
    objective: props.objective,
    prizes: props.prizes,
    startDate: props.startDate,
    updateFrequency: props.updateFrequency,
    kpis: props.kpis?.map((kpi) => ({ id: kpi.id, points: kpi.points })),
    archived: false,
  };
};

// Factory function para atualizar um game existente
export const updateGameEntity = (
  currentGame: GameEntity,
  updates: {
    status?: GameStatus;
    name?: string;
    photo?: string;
    startDate?: string;
    endDate?: string;
    managerId?: string;
    responsibles?: string[];
    objective?: string;
    prizes?: GamePrize[];
    updateFrequency?: number;
    kpis?: GameKpi[];
  },
): GameEntity => {
  return {
    ...currentGame,
    status: updates.status ?? currentGame.status,
    name: updates.name ?? currentGame.name,
    photo: updates.photo ?? currentGame.photo,
    startDate: updates.startDate ?? currentGame.startDate,
    endDate: updates.endDate ?? currentGame.endDate,
    managerId: updates.managerId ?? currentGame.managerId,
    responsibles: updates.responsibles ?? currentGame.responsibles,
    objective: updates.objective ?? currentGame.objective,
    prizes: updates.prizes ?? currentGame.prizes,
    updateFrequency: updates.updateFrequency ?? currentGame.updateFrequency,
    kpis: updates.kpis ?? currentGame.kpis,
  };
};

// Factory function para arquivar um game
export const archiveGameEntity = (game: GameEntity): GameEntity => {
  return {
    ...game,
    archived: true,
  };
};

// Factory function para desarquivar um game
export const unarchiveGameEntity = (game: GameEntity): GameEntity => {
  return {
    ...game,
    archived: false,
  };
};
