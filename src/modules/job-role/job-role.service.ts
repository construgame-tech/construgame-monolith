import {
  createJobRole,
  CreateJobRoleInput,
  updateJobRole,
  UpdateJobRoleInput,
  deleteJobRole,
  listJobRoles,
  JobRoleEntity,
} from "@domain/job-role";
import type { IJobRoleRepository } from "@domain/job-role/repositories/job-role.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class JobRoleService {
  constructor(
    @Inject("IJobRoleRepository")
    private readonly jobRoleRepository: IJobRoleRepository,
  ) {}

  async createJobRole(input: CreateJobRoleInput): Promise<JobRoleEntity> {
    const result = await createJobRole(input, this.jobRoleRepository);
    return result.jobRole;
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
    try {
      const result = await updateJobRole(input, this.jobRoleRepository);
      return result.jobRole;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Job role not found: ${input.jobRoleId}`);
      }
      throw error;
    }
  }

  async deleteJobRole(
    organizationId: string,
    jobRoleId: string,
  ): Promise<void> {
    try {
      await deleteJobRole({ organizationId, jobRoleId }, this.jobRoleRepository);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Job role not found: ${jobRoleId}`);
      }
      throw error;
    }
  }

  async listByOrganization(organizationId: string): Promise<JobRoleEntity[]> {
    const result = await listJobRoles({ organizationId }, this.jobRoleRepository);
    return result.jobRoles;
  }
}
