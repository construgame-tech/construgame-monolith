// Entidade de domínio: Kaizen Idea
// Representa uma sugestão de melhoria (kaizen idea)

export type KaizenIdeaStatus = "DRAFT" | "APPROVED" | "ARCHIVED";

export interface KaizenIdeaTask {
  name: string;
}

export interface KaizenIdeaBenefit {
  kpiId: string;
  description?: string;
}

export interface KaizenIdeaAttachment {
  name: string;
  size: number;
  filetype: string;
  createdAt: string;
  url: string;
}

export interface KaizenIdeaAuthors {
  players?: string[];
  teams?: string[];
}

export interface KaizenIdeaProblem {
  description?: string;
  images?: string[];
}

export interface KaizenIdeaSolution {
  description?: string;
  images?: string[];
}

export interface KaizenIdeaNonExecutableProject {
  projectId: string;
  userId?: string;
  justification?: string;
}

export interface KaizenIdeaEntity {
  id: string;
  organizationId: string;
  projectId?: string;
  gameId?: string;
  kaizenTypeId?: string;
  status: KaizenIdeaStatus;
  name: string;
  isRecommended?: boolean;
  authors?: KaizenIdeaAuthors;
  problem?: KaizenIdeaProblem;
  solution?: KaizenIdeaSolution;
  tasks?: KaizenIdeaTask[];
  benefits?: KaizenIdeaBenefit[];
  attachments?: KaizenIdeaAttachment[];
  createdDate: string;
  updatedDate?: string;
  sequence: number;
  executableKaizenProjectIds?: string[];
  nonExecutableProjects?: KaizenIdeaNonExecutableProject[];
}

export const createKaizenIdeaEntity = (
  props: Omit<KaizenIdeaEntity, "sequence" | "createdDate" | "status">,
): KaizenIdeaEntity => {
  return {
    ...props,
    status: "DRAFT",
    createdDate: new Date().toISOString(),
    sequence: 0,
  };
};

export const updateKaizenIdeaEntity = (
  current: KaizenIdeaEntity,
  updates: Partial<
    Omit<KaizenIdeaEntity, "id" | "organizationId" | "sequence" | "createdDate">
  >,
): KaizenIdeaEntity => {
  return {
    ...current,
    ...updates,
    updatedDate: new Date().toISOString(),
    sequence: current.sequence + 1,
  };
};
