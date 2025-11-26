// Use Case: Listar todos os projects de uma organização

import { ProjectEntity } from "../entities/project.entity";
import { IProjectRepository } from "../repositories/project.repository.interface";

export interface ListOrganizationProjectsInput {
  organizationId: string;
}

export interface ListOrganizationProjectsOutput {
  projects: ProjectEntity[];
}

export const listOrganizationProjects = async (
  input: ListOrganizationProjectsInput,
  projectRepository: IProjectRepository,
): Promise<ListOrganizationProjectsOutput> => {
  // Busca todos os projects da organização
  const projects = await projectRepository.findByOrganizationId(
    input.organizationId,
  );

  return { projects };
};
