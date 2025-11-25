import { KaizenEntity } from "@domain/kaizen/entities/kaizen.entity";
import type { IKaizenRepository } from "@domain/kaizen/repositories/kaizen.repository.interface";
import {
  CreateKaizenInput,
  createKaizen,
} from "@domain/kaizen/use-cases/create-kaizen";
import {
  UpdateKaizenInput,
  updateKaizen,
} from "@domain/kaizen/use-cases/update-kaizen";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class KaizenService {
  constructor(
    @Inject("IKaizenRepository")
    private readonly kaizenRepository: IKaizenRepository,
  ) {}

  async createKaizen(input: CreateKaizenInput): Promise<KaizenEntity> {
    const result = await createKaizen(input, this.kaizenRepository);
    return result.kaizen;
  }

  async getKaizen(kaizenId: string): Promise<KaizenEntity> {
    const kaizen = await this.kaizenRepository.findById(kaizenId);

    if (!kaizen) {
      throw new NotFoundException(`Kaizen not found: ${kaizenId}`);
    }

    return kaizen;
  }

  async updateKaizen(input: UpdateKaizenInput): Promise<KaizenEntity> {
    try {
      const result = await updateKaizen(input, this.kaizenRepository);
      return result.kaizen;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async deleteKaizen(kaizenId: string): Promise<void> {
    const kaizen = await this.kaizenRepository.findById(kaizenId);
    if (!kaizen) {
      throw new NotFoundException(`Kaizen not found: ${kaizenId}`);
    }
    await this.kaizenRepository.delete(kaizenId);
  }

  async listByGame(gameId: string): Promise<KaizenEntity[]> {
    return this.kaizenRepository.findByGameId(gameId);
  }

  async listByProject(
    organizationId: string,
    projectId: string,
  ): Promise<KaizenEntity[]> {
    return this.kaizenRepository.findByProjectId(organizationId, projectId);
  }

  async listByOrganization(organizationId: string): Promise<KaizenEntity[]> {
    return this.kaizenRepository.findByOrganizationId(organizationId);
  }
}
