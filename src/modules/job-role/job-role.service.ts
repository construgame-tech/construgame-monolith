import { randomUUID } from "node:crypto";
import {
  createJobRoleEntity,
  JobRoleEntity,
  updateJobRoleEntity,
} from "@domain/job-role/entities/job-role.entity";
import type { IJobRoleRepository } from "@domain/job-role/repositories/job-role.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

export interface CreateJobRoleInput {
  organizationId: string;
  name: string;
  variants: any[];
  createdBy?: string;
}

export interface UpdateJobRoleInput {
  organizationId: string;
  jobRoleId: string;
  name?: string;
  variants?: any[];
  updatedBy?: string;
}

@Injectable()
export class JobRoleService {
  constructor(
    @Inject("IJobRoleRepository")
    private readonly jobRoleRepository: IJobRoleRepository,
  ) {}

  async createJobRole(input: CreateJobRoleInput): Promise<JobRoleEntity> {
    const jobRole = createJobRoleEntity({
      id: randomUUID(),
      organizationId: input.organizationId,
      name: input.name,
      variants: input.variants,
      createdBy: input.createdBy,
    });

    await this.jobRoleRepository.save(jobRole);
    return jobRole;
  }

  async getJobRole(
    organizationId: string,
    jobRoleId: string,
  ): Promise<JobRoleEntity> {
    const jobRole = await this.jobRoleRepository.findById(
      organizationId,
      jobRoleId,
    );

    if (!jobRole) {
      throw new NotFoundException(`Job role not found: ${jobRoleId}`);
    }

    return jobRole;
  }

  async updateJobRole(input: UpdateJobRoleInput): Promise<JobRoleEntity> {
    const currentJobRole = await this.jobRoleRepository.findById(
      input.organizationId,
      input.jobRoleId,
    );

    if (!currentJobRole) {
      throw new NotFoundException(`Job role not found: ${input.jobRoleId}`);
    }

    const updatedJobRole = updateJobRoleEntity(currentJobRole, {
      name: input.name,
      variants: input.variants,
      updatedBy: input.updatedBy,
    });

    await this.jobRoleRepository.save(updatedJobRole);
    return updatedJobRole;
  }

  async deleteJobRole(
    organizationId: string,
    jobRoleId: string,
  ): Promise<void> {
    const jobRole = await this.jobRoleRepository.findById(
      organizationId,
      jobRoleId,
    );
    if (!jobRole) {
      throw new NotFoundException(`Job role not found: ${jobRoleId}`);
    }
    await this.jobRoleRepository.delete(organizationId, jobRoleId);
  }

  async listByOrganization(organizationId: string): Promise<JobRoleEntity[]> {
    return this.jobRoleRepository.findByOrganizationId(organizationId);
  }
}
