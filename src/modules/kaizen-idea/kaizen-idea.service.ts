import {
  createKaizenIdea,
  CreateKaizenIdeaInput,
  updateKaizenIdea,
  UpdateKaizenIdeaInput,
  getKaizenIdea,
  deleteKaizenIdea,
  listOrganizationKaizenIdeas,
  KaizenIdeaEntity,
} from "@domain/kaizen-idea";
import type { IKaizenIdeaRepository } from "@domain/kaizen-idea/repositories/kaizen-idea.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class KaizenIdeaService {
  constructor(
    @Inject("IKaizenIdeaRepository")
    private readonly ideaRepository: IKaizenIdeaRepository,
  ) {}

  async createIdea(input: CreateKaizenIdeaInput): Promise<KaizenIdeaEntity> {
    const result = await createKaizenIdea(input, this.ideaRepository);
    return result.idea;
  }

  async getIdea(
    organizationId: string,
    ideaId: string,
  ): Promise<KaizenIdeaEntity> {
    try {
      const result = await getKaizenIdea(
        { organizationId, ideaId },
        this.ideaRepository,
      );
      return result.idea;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Kaizen idea not found: ${ideaId}`);
      }
      throw error;
    }
  }

  async updateIdea(input: UpdateKaizenIdeaInput): Promise<KaizenIdeaEntity> {
    try {
      const result = await updateKaizenIdea(input, this.ideaRepository);
      return result.idea;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Kaizen idea not found: ${input.ideaId}`);
      }
      throw error;
    }
  }

  async deleteIdea(organizationId: string, ideaId: string): Promise<void> {
    try {
      await deleteKaizenIdea({ organizationId, ideaId }, this.ideaRepository);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Kaizen idea not found: ${ideaId}`);
      }
      throw error;
    }
  }

  async listByOrganization(
    organizationId: string,
  ): Promise<KaizenIdeaEntity[]> {
    const result = await listOrganizationKaizenIdeas(
      { organizationId },
      this.ideaRepository,
    );
    return result.ideas;
  }
}
