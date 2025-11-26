// Use Case: Criar um novo project

import { randomUUID } from "node:crypto";
import {
  createProjectEntity,
  ProjectEntity,
  ProjectPrize,
} from "../entities/project.entity";
import { IProjectRepository } from "../repositories/project.repository.interface";

export interface CreateProjectInput {
  organizationId: string;
  name: string;
  responsibles?: string[];
  activeGameId?: string;
  photo?: string;
  type?: string;
  state?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  prizes?: ProjectPrize[];
  teams?: string[];
}

export interface CreateProjectOutput {
  project: ProjectEntity;
}

export const createProject = async (
  input: CreateProjectInput,
  projectRepository: IProjectRepository,
): Promise<CreateProjectOutput> => {
  // Gera um ID único para o novo project
  const projectId = randomUUID();

  // Cria a entidade de domínio
  const project = createProjectEntity({
    id: projectId,
    organizationId: input.organizationId,
    name: input.name,
    responsibles: input.responsibles,
    activeGameId: input.activeGameId,
    photo: input.photo,
    type: input.type,
    state: input.state,
    city: input.city,
    startDate: input.startDate,
    endDate: input.endDate,
    prizes: input.prizes,
    teams: input.teams,
  });

  // Persiste no repositório
  await projectRepository.save(project);

  return { project };
};
