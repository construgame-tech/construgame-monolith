// Entidade de domínio: Kaizen
// Representa um kaizen (melhoria contínua) com tarefas, benefícios e anexos

export type KaizenStatus = "ACTIVE" | "DONE" | "APPROVED" | "ARCHIVED";

export interface KaizenTask {
  name: string;
  isComplete: boolean;
  responsibleId: string;
  endDate?: string;
  budget?: number;
}

export interface KaizenBenefit {
  kpiId: string;
  description?: string;
}

export interface KaizenAttachment {
  name: string;
  size: number;
  filetype: string;
  createdAt: string;
  url: string;
}

export interface KaizenResponsibles {
  players?: string[];
  teams?: string[];
}

export interface KaizenEntity {
  id: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  status: KaizenStatus;
  name: string;
  createdDate: string;
  updatedDate?: string;
  sequence: number;

  // Campos opcionais
  originalKaizenId?: string; // ID do kaizen original quando é uma réplica
  leaderId?: string; // Campo legado (migrar para responsibles.players)
  teamId?: string; // Campo legado (migrar para responsibles.teams)
  category?: number; // Campo legado (migrar para kaizenTypeId)

  // Campos atuais
  kaizenTypeId?: string;
  kaizenIdeaId?: string;
  responsibles?: KaizenResponsibles;

  // Descrição do problema e solução
  currentSituation?: string;
  currentSituationImages?: string[];
  solution?: string;
  solutionImages?: string[];

  // Tarefas e benefícios
  tasks?: KaizenTask[];
  benefits?: KaizenBenefit[];

  // Recursos e arquivos
  resources?: string;
  files?: string[];
  attachments?: KaizenAttachment[];

  // Replicação
  replicas?: string[]; // IDs dos kaizens replicados a partir deste
}

// Factory function para criar um novo kaizen com valores padrão
export const createKaizenEntity = (props: {
  id: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  name: string;
  leaderId?: string;
  teamId?: string;
  category?: number;
  currentSituation?: string;
  currentSituationImages?: string[];
  solution?: string;
  solutionImages?: string[];
  tasks?: KaizenTask[];
  responsibles?: KaizenResponsibles;
  kaizenIdeaId?: string;
  kaizenTypeId?: string;
  benefits?: KaizenBenefit[];
  files?: string[];
  attachments?: KaizenAttachment[];
  resources?: string;
}): KaizenEntity => {
  const now = new Date().toISOString();

  return {
    id: props.id,
    organizationId: props.organizationId,
    projectId: props.projectId,
    gameId: props.gameId,
    status: "ACTIVE",
    name: props.name,
    createdDate: now,
    sequence: 0,
    leaderId: props.leaderId,
    teamId: props.teamId,
    category: props.category,
    currentSituation: props.currentSituation,
    currentSituationImages: props.currentSituationImages,
    solution: props.solution,
    solutionImages: props.solutionImages,
    tasks: props.tasks?.map((task) => ({
      ...task,
      budget: task.budget !== 0 ? task.budget : undefined,
    })),
    responsibles: props.responsibles,
    kaizenIdeaId: props.kaizenIdeaId,
    kaizenTypeId: props.kaizenTypeId,
    benefits: props.benefits,
    files: props.files,
    attachments: props.attachments,
    resources: props.resources,
  };
};

// Factory function para atualizar um kaizen existente
export const updateKaizenEntity = (
  currentKaizen: KaizenEntity,
  updates: {
    gameId?: string;
    leaderId?: string;
    teamId?: string;
    name?: string;
    category?: number;
    currentSituation?: string;
    currentSituationImages?: string[];
    solution?: string;
    solutionImages?: string[];
    tasks?: KaizenTask[];
    benefits?: KaizenBenefit[];
    files?: string[];
    attachments?: KaizenAttachment[];
    resources?: string;
    responsibles?: KaizenResponsibles;
    kaizenIdeaId?: string;
    kaizenTypeId?: string;
  },
): KaizenEntity => {
  const isKaizenDone = currentKaizen.status === "DONE";
  const isReplica = !!currentKaizen.originalKaizenId;

  return {
    ...currentKaizen,
    gameId: updates.gameId ?? currentKaizen.gameId,
    // Se kaizen está DONE, não permite alterar líder/time
    leaderId: isKaizenDone
      ? currentKaizen.leaderId
      : (updates.leaderId ?? currentKaizen.leaderId),
    teamId: isKaizenDone
      ? currentKaizen.teamId
      : (updates.teamId ?? currentKaizen.teamId),
    // Se é réplica, não permite alterar nome e categoria
    name: isReplica ? currentKaizen.name : (updates.name ?? currentKaizen.name),
    category:
      isReplica || isKaizenDone
        ? currentKaizen.category
        : (updates.category ?? currentKaizen.category),
    currentSituation:
      updates.currentSituation ?? currentKaizen.currentSituation,
    currentSituationImages:
      updates.currentSituationImages ?? currentKaizen.currentSituationImages,
    solution: updates.solution ?? currentKaizen.solution,
    solutionImages: updates.solutionImages ?? currentKaizen.solutionImages,
    tasks:
      updates.tasks?.map((task) => ({
        ...task,
        budget: task.budget !== 0 ? task.budget : undefined,
      })) ?? currentKaizen.tasks,
    benefits: updates.benefits ?? currentKaizen.benefits,
    files: updates.files ?? currentKaizen.files,
    attachments: updates.attachments ?? currentKaizen.attachments,
    resources: updates.resources ?? currentKaizen.resources,
    responsibles: updates.responsibles ?? currentKaizen.responsibles,
    kaizenIdeaId: updates.kaizenIdeaId ?? currentKaizen.kaizenIdeaId,
    kaizenTypeId: updates.kaizenTypeId ?? currentKaizen.kaizenTypeId,
    updatedDate: new Date().toISOString(),
    sequence: currentKaizen.sequence + 1,
  };
};

// Factory function para completar um kaizen (status ACTIVE -> DONE)
export const completeKaizenEntity = (kaizen: KaizenEntity): KaizenEntity => {
  if (kaizen.status !== "ACTIVE") {
    throw new Error("Kaizen is not active");
  }

  return {
    ...kaizen,
    status: "DONE",
    updatedDate: new Date().toISOString(),
    sequence: kaizen.sequence + 1,
  };
};

// Factory function para aprovar um kaizen (status DONE -> APPROVED)
export const approveKaizenEntity = (kaizen: KaizenEntity): KaizenEntity => {
  if (kaizen.status === "APPROVED") {
    return kaizen; // Já está aprovado, retorna sem alterações
  }

  if (kaizen.status !== "DONE") {
    throw new Error("Kaizen is not completed");
  }

  return {
    ...kaizen,
    status: "APPROVED",
    updatedDate: new Date().toISOString(),
    sequence: kaizen.sequence + 1,
  };
};

// Factory function para reabrir um kaizen (status DONE/APPROVED -> ACTIVE)
export const reopenKaizenEntity = (kaizen: KaizenEntity): KaizenEntity => {
  if (kaizen.status !== "DONE" && kaizen.status !== "APPROVED") {
    throw new Error("Kaizen is not done");
  }

  return {
    ...kaizen,
    status: "ACTIVE",
    updatedDate: new Date().toISOString(),
    sequence: kaizen.sequence + 1,
  };
};

// Factory function para arquivar um kaizen (status ACTIVE -> ARCHIVED)
export const archiveKaizenEntity = (kaizen: KaizenEntity): KaizenEntity => {
  if (kaizen.status !== "ACTIVE") {
    throw new Error("Kaizen is not active");
  }

  return {
    ...kaizen,
    status: "ARCHIVED",
    updatedDate: new Date().toISOString(),
    sequence: kaizen.sequence + 1,
  };
};

// Factory function para desarquivar um kaizen (status ARCHIVED -> ACTIVE)
export const unarchiveKaizenEntity = (kaizen: KaizenEntity): KaizenEntity => {
  if (kaizen.status !== "ARCHIVED") {
    throw new Error("Kaizen is not archived");
  }

  return {
    ...kaizen,
    status: "ACTIVE",
    updatedDate: new Date().toISOString(),
    sequence: kaizen.sequence + 1,
  };
};

// Factory function para criar uma réplica de um kaizen
export const createKaizenReplicaEntity = (props: {
  id: string;
  originalKaizenId: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  leaderId: string;
  name: string;
  category?: number;
  tasks?: KaizenTask[];
  attachments?: KaizenAttachment[];
  benefits?: KaizenBenefit[];
}): KaizenEntity => {
  const now = new Date().toISOString();

  return {
    id: props.id,
    originalKaizenId: props.originalKaizenId,
    organizationId: props.organizationId,
    projectId: props.projectId,
    gameId: props.gameId,
    status: "ACTIVE",
    name: props.name,
    category: props.category,
    createdDate: now,
    sequence: 0,
    leaderId: props.leaderId,
    responsibles: {},
    // Tarefas da réplica resetam o status de conclusão e apontam para o novo líder
    tasks: props.tasks?.map((task) => ({
      ...task,
      responsibleId: props.leaderId,
      isComplete: false,
      endDate: undefined,
    })),
    attachments: props.attachments,
    benefits: props.benefits,
  };
};

// Factory function para adicionar uma réplica à lista de réplicas
export const addReplicaToKaizenEntity = (
  kaizen: KaizenEntity,
  replicaId: string,
): KaizenEntity => {
  return {
    ...kaizen,
    replicas: [...(kaizen.replicas || []), replicaId],
    updatedDate: new Date().toISOString(),
    sequence: kaizen.sequence + 1,
  };
};

// Factory function para atualizar réplicas (usado quando o kaizen original é atualizado)
export const updateReplicaFromOriginal = (
  replica: KaizenEntity,
  updates: {
    name: string;
    category?: number;
  },
): KaizenEntity => {
  return {
    ...replica,
    name: updates.name,
    category: updates.category,
    updatedDate: new Date().toISOString(),
    sequence: replica.sequence + 1,
  };
};

// Incrementa a sequence para deleção
export const incrementKaizenSequence = (kaizen: KaizenEntity): KaizenEntity => {
  return {
    ...kaizen,
    sequence: kaizen.sequence + 1,
  };
};
