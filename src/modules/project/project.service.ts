import { ProjectEntity } from "@domain/project/entities/project.entity";
import type { IProjectRepository } from "@domain/project/repositories/project.repository.interface";
import {
  CreateProjectInput,
  createProject,
} from "@domain/project/use-cases/create-project";
import { deleteProject } from "@domain/project/use-cases/delete-project";
import { getProject } from "@domain/project/use-cases/get-project";
import { listOrganizationProjects } from "@domain/project/use-cases/list-organization-projects";
import {
  UpdateProjectInput,
  updateProject,
} from "@domain/project/use-cases/update-project";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class ProjectService {
  constructor(
    @Inject("IProjectRepository")
    private readonly projectRepository: IProjectRepository,
  ) {}

  async createProject(input: CreateProjectInput): Promise<ProjectEntity> {
    const result = await createProject(input, this.projectRepository);
    return result.project;
  }

  async getProject(
    organizationId: string,
    projectId: string,
  ): Promise<ProjectEntity> {
    const result = await getProject(
      { organizationId, projectId },
      this.projectRepository,
    );

    if (!result.project) {
      throw new NotFoundException(`Project not found: ${projectId}`);
    }

    return result.project;
  }

  async updateProject(input: UpdateProjectInput): Promise<ProjectEntity> {
    try {
      const result = await updateProject(input, this.projectRepository);
      return result.project;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async deleteProject(
    organizationId: string,
    projectId: string,
  ): Promise<void> {
    try {
      await deleteProject(
        { organizationId, projectId },
        this.projectRepository,
      );
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async listOrganizationProjects(
    organizationId: string,
  ): Promise<ProjectEntity[]> {
    const result = await listOrganizationProjects(
      { organizationId },
      this.projectRepository,
    );
    return result.projects;
  }
}
