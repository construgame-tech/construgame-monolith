// Use Case: Atualizar um job role existente

import { randomUUID } from "node:crypto";
import {
  JobRoleEntity,
  JobRoleVariant,
  updateJobRoleEntity,
} from "../entities/job-role.entity";
import { IJobRoleRepository } from "../repositories/job-role.repository.interface";

export interface UpdateJobRoleVariantInput {
  id?: string;
  salary?: number;
  seniority?: string;
  state?: string;
  hoursPerDay?: number;
}

export interface UpdateJobRoleInput {
  organizationId: string;
  jobRoleId: string;
  name?: string;
  variants?: UpdateJobRoleVariantInput[];
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

  // Gera IDs para variantes que não possuem
  const variantsWithIds: JobRoleVariant[] | undefined = input.variants?.map((variant) => ({
    id: variant.id ?? randomUUID(),
    salary: variant.salary,
    seniority: variant.seniority,
    state: variant.state,
    hoursPerDay: variant.hoursPerDay,
  }));

  // Aplica as atualizações na entidade
  const updatedJobRole = updateJobRoleEntity(currentJobRole, {
    name: input.name,
    variants: variantsWithIds,
    updatedBy: input.updatedBy,
  });

  // Persiste no repositório
  await jobRoleRepository.save(updatedJobRole);

  return { jobRole: updatedJobRole };
};
