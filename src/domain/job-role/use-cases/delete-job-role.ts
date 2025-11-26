// Use Case: Deletar um job role

import { IJobRoleRepository } from "../repositories/job-role.repository.interface";

export interface DeleteJobRoleInput {
  organizationId: string;
  jobRoleId: string;
}

export interface DeleteJobRoleOutput {
  success: boolean;
}

export const deleteJobRole = async (
  input: DeleteJobRoleInput,
  jobRoleRepository: IJobRoleRepository,
): Promise<DeleteJobRoleOutput> => {
  // Verifica se o job role existe
  const jobRole = await jobRoleRepository.findById(
    input.organizationId,
    input.jobRoleId,
  );

  if (!jobRole) {
    throw new Error(`Job Role not found: ${input.jobRoleId}`);
  }

  // Deleta do repositório
  await jobRoleRepository.delete(input.organizationId, input.jobRoleId);

  return { success: true };
};
