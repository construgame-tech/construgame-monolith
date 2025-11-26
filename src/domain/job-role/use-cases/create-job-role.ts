// Use Case: Criar um novo job role

import { randomUUID } from "node:crypto";
import {
  createJobRoleEntity,
  JobRoleEntity,
  JobRoleVariant,
} from "../entities/job-role.entity";
import { IJobRoleRepository } from "../repositories/job-role.repository.interface";

export interface CreateJobRoleInput {
  organizationId: string;
  name: string;
  variants: JobRoleVariant[];
  createdBy?: string;
}

export interface CreateJobRoleOutput {
  jobRole: JobRoleEntity;
}

export const createJobRole = async (
  input: CreateJobRoleInput,
  jobRoleRepository: IJobRoleRepository,
): Promise<CreateJobRoleOutput> => {
  // Gera um ID único para o novo job role
  const jobRoleId = randomUUID();

  // Cria a entidade de domínio
  const jobRole = createJobRoleEntity({
    id: jobRoleId,
    organizationId: input.organizationId,
    name: input.name,
    variants: input.variants,
    createdBy: input.createdBy,
  });

  // Persiste no repositório
  await jobRoleRepository.save(jobRole);

  return { jobRole };
};
