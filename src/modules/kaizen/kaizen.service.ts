import {
  KaizenEntity,
  KaizenCommentEntity,
} from "@domain/kaizen";
import type { IKaizenRepository } from "@domain/kaizen/repositories/kaizen.repository.interface";
import type { IKaizenCommentRepository } from "@domain/kaizen/repositories/kaizen-comment.repository.interface";
import {
  approveKaizen,
  archiveKaizen,
  completeKaizen,
  CreateKaizenInput,
  createKaizen,
  reopenKaizen,
  ReplicateKaizenInput,
  replicateKaizen,
  unarchiveKaizen,
  UpdateKaizenInput,
  updateKaizen,
  createKaizenComment,
  listKaizenComments,
  deleteKaizenComment,
} from "@domain/kaizen";
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

  async approve(kaizenId: string): Promise<KaizenEntity> {
    try {
      const result = await approveKaizen({ kaizenId }, this.kaizenRepository);
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
    const { comments } = await listKaizenComments(
      { kaizenId },
      this.commentRepository,
    );
    return comments;
  }

  async createComment(
    kaizenId: string,
    userId: string,
    text: string,
  ): Promise<KaizenCommentEntity> {
    const { comment } = await createKaizenComment(
      { kaizenId, userId, text },
      this.commentRepository,
    );
    return comment;
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      await deleteKaizenComment(
        { commentId },
        this.commentRepository,
      );
    } catch {
      throw new NotFoundException(`Comment not found: ${commentId}`);
    }
  }
}
