import {
  createKaizenIdeaEntity,
  KaizenIdeaEntity,
  updateKaizenIdeaEntity,
} from "@domain/kaizen-idea/entities/kaizen-idea.entity";
import type { IKaizenIdeaRepository } from "@domain/kaizen-idea/repositories/kaizen-idea.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";

export interface CreateKaizenIdeaInput {
  organizationId: string;
  projectId?: string;
  gameId?: string;
  kaizenTypeId?: string;
  name: string;
  isRecommended?: boolean;
  authors?: any;
  problem?: any;
  solution?: any;
  tasks?: any[];
  benefits?: any[];
  attachments?: any[];
  executableKaizenProjectIds?: string[];
  nonExecutableProjects?: any[];
}

export interface UpdateKaizenIdeaInput {
  ideaId: string;
  organizationId: string;
  projectId?: string;
  gameId?: string;
  kaizenTypeId?: string;
  status?: "DRAFT" | "APPROVED" | "ARCHIVED";
  name?: string;
  isRecommended?: boolean;
  authors?: any;
  problem?: any;
  solution?: any;
  tasks?: any[];
  benefits?: any[];
  attachments?: any[];
  executableKaizenProjectIds?: string[];
  nonExecutableProjects?: any[];
}

@Injectable()
export class KaizenIdeaService {
  constructor(
    @Inject("IKaizenIdeaRepository")
    private readonly ideaRepository: IKaizenIdeaRepository,
  ) {}

  async createIdea(input: CreateKaizenIdeaInput): Promise<KaizenIdeaEntity> {
    const idea = createKaizenIdeaEntity({
      id: randomUUID(),
      organizationId: input.organizationId,
      projectId: input.projectId,
      gameId: input.gameId,
      kaizenTypeId: input.kaizenTypeId,
      name: input.name,
      isRecommended: input.isRecommended,
      authors: input.authors,
      problem: input.problem,
      solution: input.solution,
      tasks: input.tasks,
      benefits: input.benefits,
      attachments: input.attachments,
      executableKaizenProjectIds: input.executableKaizenProjectIds,
      nonExecutableProjects: input.nonExecutableProjects,
    });

    await this.ideaRepository.save(idea);
    return idea;
  }

  async getIdea(
    organizationId: string,
    ideaId: string,
  ): Promise<KaizenIdeaEntity> {
    const idea = await this.ideaRepository.findById(organizationId, ideaId);

    if (!idea) {
      throw new NotFoundException(`Kaizen idea not found: ${ideaId}`);
    }

    return idea;
  }

  async updateIdea(input: UpdateKaizenIdeaInput): Promise<KaizenIdeaEntity> {
    const currentIdea = await this.ideaRepository.findById(
      input.organizationId,
      input.ideaId,
    );

    if (!currentIdea) {
      throw new NotFoundException(`Kaizen idea not found: ${input.ideaId}`);
    }

    const updatedIdea = updateKaizenIdeaEntity(currentIdea, {
      projectId: input.projectId,
      gameId: input.gameId,
      kaizenTypeId: input.kaizenTypeId,
      status: input.status,
      name: input.name,
      isRecommended: input.isRecommended,
      authors: input.authors,
      problem: input.problem,
      solution: input.solution,
      tasks: input.tasks,
      benefits: input.benefits,
      attachments: input.attachments,
      executableKaizenProjectIds: input.executableKaizenProjectIds,
      nonExecutableProjects: input.nonExecutableProjects,
    });

    await this.ideaRepository.save(updatedIdea);
    return updatedIdea;
  }

  async deleteIdea(organizationId: string, ideaId: string): Promise<void> {
    const idea = await this.ideaRepository.findById(organizationId, ideaId);
    if (!idea) {
      throw new NotFoundException(`Kaizen idea not found: ${ideaId}`);
    }
    await this.ideaRepository.delete(organizationId, ideaId);
  }

  async listByOrganization(
    organizationId: string,
  ): Promise<KaizenIdeaEntity[]> {
    return this.ideaRepository.findByOrganizationId(organizationId);
  }
}
