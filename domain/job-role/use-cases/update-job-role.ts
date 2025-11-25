// Use Case: Atualizar um job role existente

import {
  JobRoleEntity,
  JobRoleVariant,
  updateJobRoleEntity,
} from "../entities/job-role.entity";
import { IJobRoleRepository } from "../repositories/job-role.repository.interface";

export interface UpdateJobRoleInput {
  organizationId: string;
  jobRoleId: string;
  name?: string;
  variants?: JobRoleVariant[];
  updatedBy?: string;
}

export interface UpdateJobRoleOutput {
  jobRole: JobRoleEntity;
}

export const updateJobRole = async (
  input: UpdateJobRoleInput,
  jobRoleRepository: IJobRoleRepository,
): Promise<UpdateJobRoleOutput> => {
  // Busca o job role atual
  const currentJobRole = await jobRoleRepository.findById(
    input.organizationId,
    input.jobRoleId,
  );

  if (!currentJobRole) {
    throw new Error(`Job Role not found: ${input.jobRoleId}`);
  }

  // Aplica as atualizações na entidade
  const updatedJobRole = updateJobRoleEntity(currentJobRole, {
    name: input.name,
    variants: input.variants,
    updatedBy: input.updatedBy,
  });

  // Persiste no repositório
  await jobRoleRepository.save(updatedJobRole);

  return { jobRole: updatedJobRole };
};
