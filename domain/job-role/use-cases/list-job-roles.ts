// Use Case: Listar todos os job roles de uma organização

import { JobRoleEntity } from "../entities/job-role.entity";
import { IJobRoleRepository } from "../repositories/job-role.repository.interface";

export interface ListJobRolesInput {
  organizationId: string;
}

export interface ListJobRolesOutput {
  jobRoles: JobRoleEntity[];
}

export const listJobRoles = async (
  input: ListJobRolesInput,
  jobRoleRepository: IJobRoleRepository,
): Promise<ListJobRolesOutput> => {
  // Busca todos os job roles da organização
  const jobRoles = await jobRoleRepository.findByOrganizationId(
    input.organizationId,
  );

  return { jobRoles };
};
