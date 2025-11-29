// Entidade de domínio: GameManagerTask
// Representa uma tarefa dentro de um GameManager

export interface GameManagerTaskEntity {
  id: string;
  gameManagerId: string;
  organizationId: string;
  projectId: string;
  name: string;
  kpiId?: string;
  description?: string;
  rewardPoints?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Factory function para criar uma nova Task de GameManager
export const createGameManagerTaskEntity = (props: {
  id: string;
  gameManagerId: string;
  organizationId: string;
  projectId: string;
  name: string;
  kpiId?: string;
  description?: string;
  rewardPoints?: number;
}): GameManagerTaskEntity => {
  return {
    id: props.id,
    gameManagerId: props.gameManagerId,
    organizationId: props.organizationId,
    projectId: props.projectId,
    name: props.name,
    kpiId: props.kpiId,
    description: props.description,
    rewardPoints: props.rewardPoints,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Factory function para atualizar uma Task de GameManager
export const updateGameManagerTaskEntity = (
  current: GameManagerTaskEntity,
  updates: {
    name?: string;
    kpiId?: string;
    description?: string;
    rewardPoints?: number;
  },
): GameManagerTaskEntity => {
  return {
    ...current,
    name: updates.name ?? current.name,
    kpiId: updates.kpiId ?? current.kpiId,
    description: updates.description ?? current.description,
    rewardPoints: updates.rewardPoints ?? current.rewardPoints,
    updatedAt: new Date(),
  };
};
