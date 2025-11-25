// Use Case: Deletar um project

import { IProjectRepository } from "../repositories/project.repository.interface";

export interface DeleteProjectInput {
  organizationId: string;
  projectId: string;
}

export interface DeleteProjectOutput {
  success: boolean;
}

export const deleteProject = async (
  input: DeleteProjectInput,
  projectRepository: IProjectRepository,
): Promise<DeleteProjectOutput> => {
  // Verifica se o project existe
  const project = await projectRepository.findById(
    input.organizationId,
    input.projectId,
  );

  if (!project) {
    throw new Error(`Project not found: ${input.projectId}`);
  }

  // Deleta do repositório
  await projectRepository.delete(input.organizationId, input.projectId);

  return { success: true };
};
