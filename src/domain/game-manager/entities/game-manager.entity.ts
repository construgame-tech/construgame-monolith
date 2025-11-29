// Entidade de domínio: GameManager
// Representa um gerenciador de game (planejamento de jogo antes de iniciar)

export interface GameManagerEntity {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  photo?: string;
  objective?: string;
  updateFrequency?: number;
  managerId?: string;
  responsibles?: string[];
  startDate?: string;
  endDate?: string;
  gameLength?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Factory function para criar um novo GameManager
export const createGameManagerEntity = (props: {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  photo?: string;
  objective?: string;
  updateFrequency?: number;
  managerId?: string;
  responsibles?: string[];
  startDate?: string;
  endDate?: string;
  gameLength?: number;
}): GameManagerEntity => {
  return {
    id: props.id,
    organizationId: props.organizationId,
    projectId: props.projectId,
    name: props.name,
    photo: props.photo,
    objective: props.objective,
    updateFrequency: props.updateFrequency,
    managerId: props.managerId,
    responsibles: props.responsibles,
    startDate: props.startDate,
    endDate: props.endDate,
    gameLength: props.gameLength,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Factory function para atualizar um GameManager existente
export const updateGameManagerEntity = (
  current: GameManagerEntity,
  updates: {
    name?: string;
    photo?: string;
    objective?: string;
    updateFrequency?: number;
    managerId?: string;
    responsibles?: string[];
    startDate?: string;
    endDate?: string;
    gameLength?: number;
  },
): GameManagerEntity => {
  return {
    ...current,
    name: updates.name ?? current.name,
    photo: updates.photo ?? current.photo,
    objective: updates.objective ?? current.objective,
    updateFrequency: updates.updateFrequency ?? current.updateFrequency,
    managerId: updates.managerId ?? current.managerId,
    responsibles: updates.responsibles ?? current.responsibles,
    startDate: updates.startDate ?? current.startDate,
    endDate: updates.endDate ?? current.endDate,
    gameLength: updates.gameLength ?? current.gameLength,
    updatedAt: new Date(),
  };
};
