// Use Case: Buscar um project por ID

import { ProjectEntity } from "../entities/project.entity";
import { IProjectRepository } from "../repositories/project.repository.interface";

export interface GetProjectInput {
  organizationId: string;
  projectId: string;
}

export interface GetProjectOutput {
  project: ProjectEntity;
}

export const getProject = async (
  input: GetProjectInput,
  projectRepository: IProjectRepository,
): Promise<GetProjectOutput> => {
  // Busca o project
  const project = await projectRepository.findById(
    input.organizationId,
    input.projectId,
  );

  if (!project) {
    throw new Error(`Project not found: ${input.projectId}`);
  }

  return { project };
};
