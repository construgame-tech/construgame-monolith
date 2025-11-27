import { randomUUID } from "node:crypto";
import { KaizenEntity } from "@domain/kaizen/entities/kaizen.entity";
import {
  createKaizenCommentEntity,
  KaizenCommentEntity,
} from "@domain/kaizen/entities/kaizen-comment.entity";
import type { IKaizenRepository } from "@domain/kaizen/repositories/kaizen.repository.interface";
import type { IKaizenCommentRepository } from "@domain/kaizen/repositories/kaizen-comment.repository.interface";
import { archiveKaizen } from "@domain/kaizen/use-cases/archive-kaizen";
import { completeKaizen } from "@domain/kaizen/use-cases/complete-kaizen";
import {
  CreateKaizenInput,
  createKaizen,
} from "@domain/kaizen/use-cases/create-kaizen";
import { reopenKaizen } from "@domain/kaizen/use-cases/reopen-kaizen";
import {
  ReplicateKaizenInput,
  replicateKaizen,
} from "@domain/kaizen/use-cases/replicate-kaizen";
import { unarchiveKaizen } from "@domain/kaizen/use-cases/unarchive-kaizen";
import {
  UpdateKaizenInput,
  updateKaizen,
} from "@domain/kaizen/use-cases/update-kaizen";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

@Injectable()
export class KaizenService {
  constructor(
    @Inject("IKaizenRepository")
    private readonly kaizenRepository: IKaizenRepository,
    @Inject("IKaizenCommentRepository")
    private readonly commentRepository: IKaizenCommentRepository,
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

  async countByOrganization(organizationId: string): Promise<number> {
    const kaizens =
      await this.kaizenRepository.findByOrganizationId(organizationId);
    return kaizens.length;
  }

  async complete(kaizenId: string): Promise<KaizenEntity> {
    try {
      const result = await completeKaizen({ kaizenId }, this.kaizenRepository);
      return result.kaizen;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async reopen(kaizenId: string): Promise<KaizenEntity> {
    try {
      const result = await reopenKaizen({ kaizenId }, this.kaizenRepository);
      return result.kaizen;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async archive(kaizenId: string): Promise<KaizenEntity> {
    try {
      const result = await archiveKaizen({ kaizenId }, this.kaizenRepository);
      return result.kaizen;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async unarchive(kaizenId: string): Promise<KaizenEntity> {
    try {
      const result = await unarchiveKaizen({ kaizenId }, this.kaizenRepository);
      return result.kaizen;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async replicate(input: ReplicateKaizenInput): Promise<KaizenEntity> {
    try {
      const result = await replicateKaizen(input, this.kaizenRepository);
      return result.kaizen;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  // ========== Comment Methods ==========

  async listComments(kaizenId: string): Promise<KaizenCommentEntity[]> {
    return this.commentRepository.findByKaizenId(kaizenId);
  }

  async createComment(
    kaizenId: string,
    userId: string,
    text: string,
  ): Promise<KaizenCommentEntity> {
    const comment = createKaizenCommentEntity({
      id: randomUUID(),
      kaizenId,
      userId,
      text,
      createdAt: new Date().toISOString(),
    });
    await this.commentRepository.save(comment);
    return comment;
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException(`Comment not found: ${commentId}`);
    }
    await this.commentRepository.delete(commentId);
  }
}
