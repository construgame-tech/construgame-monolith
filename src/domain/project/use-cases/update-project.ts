// Use Case: Atualizar um project existente

import {
  ProjectEntity,
  ProjectPrize,
  ProjectStatus,
  updateProjectEntity,
} from "../entities/project.entity";
import { IProjectRepository } from "../repositories/project.repository.interface";

export interface UpdateProjectInput {
  organizationId: string;
  projectId: string;
  name?: string;
  responsibles?: string[];
  status?: ProjectStatus;
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

export interface UpdateProjectOutput {
  project: ProjectEntity;
}

export const updateProject = async (
  input: UpdateProjectInput,
  projectRepository: IProjectRepository,
): Promise<UpdateProjectOutput> => {
  // Busca o project atual
  const currentProject = await projectRepository.findById(
    input.organizationId,
    input.projectId,
  );

  if (!currentProject) {
    throw new Error(`Project not found: ${input.projectId}`);
  }

  // Aplica as atualizações na entidade
  const updatedProject = updateProjectEntity(currentProject, {
    name: input.name,
    responsibles: input.responsibles,
    status: input.status,
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
  await projectRepository.save(updatedProject);

  return { project: updatedProject };
};
