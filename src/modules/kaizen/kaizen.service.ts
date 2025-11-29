import type { IGameRepository } from "@domain/game/repositories/game.repository.interface";
import {
  creditTeamKaizenPoints,
  creditUserKaizenPoints,
} from "@domain/game-points";
import {
  approveKaizen,
  archiveKaizen,
  CreateKaizenInput,
  completeKaizen,
  createKaizen,
  createKaizenComment,
  deleteKaizenComment,
  KaizenCommentEntity,
  KaizenEntity,
  listKaizenComments,
  ReplicateKaizenInput,
  reopenKaizen,
  replicateKaizen,
  UpdateKaizenInput,
  unarchiveKaizen,
  updateKaizen,
} from "@domain/kaizen";
import type { IKaizenRepository } from "@domain/kaizen/repositories/kaizen.repository.interface";
import type { IKaizenCommentRepository } from "@domain/kaizen/repositories/kaizen-comment.repository.interface";
import type { IKaizenTypeRepository } from "@domain/kaizen-type/repositories/kaizen-type.repository.interface";
import type {
  TeamGamePointsRepository,
  UserGamePointsRepository,
} from "@infrastructure/repositories/game-points.repository";
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
    @Inject("IKaizenTypeRepository")
    private readonly kaizenTypeRepository: IKaizenTypeRepository,
    @Inject("UserGamePointsRepository")
    private readonly userGamePointsRepository: UserGamePointsRepository,
    @Inject("TeamGamePointsRepository")
    private readonly teamGamePointsRepository: TeamGamePointsRepository,
    @Inject("IGameRepository")
    private readonly gameRepository: IGameRepository,
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
      const kaizen = result.kaizen;

      // Creditar pontos de kaizen aos responsáveis
      await this.creditKaizenPoints(kaizen);

      return kaizen;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Credita pontos de kaizen aos responsáveis quando aprovado.
   *
   * Regra de negócio V2:
   * - Pontos são determinados pelo kaizenType.points
   * - Cada responsável (player) recebe os pontos completos
   * - Cada time responsável recebe os pontos completos
   * - Precisão de 4 casas decimais
   */
  private async creditKaizenPoints(kaizen: KaizenEntity): Promise<void> {
    // Verificar se tem kaizenTypeId
    if (!kaizen.kaizenTypeId) {
      // Fallback: sem tipo definido, não credita pontos
      return;
    }

    // Buscar o kaizenType para obter os pontos
    const kaizenType = await this.kaizenTypeRepository.findById(
      kaizen.organizationId,
      kaizen.kaizenTypeId,
    );

    if (!kaizenType || kaizenType.points <= 0) {
      return;
    }

    // Buscar o game para obter organizationId e projectId
    const game = await this.gameRepository.findByIdOnly(kaizen.gameId);
    if (!game) {
      return;
    }

    const pointsToCredit = kaizenType.points;

    // Creditar pontos aos players responsáveis
    const playerIds = kaizen.responsibles?.players || [];
    for (const userId of playerIds) {
      await creditUserKaizenPoints(
        {
          userId,
          gameId: kaizen.gameId,
          organizationId: game.organizationId,
          projectId: game.projectId,
          pointsToCredit,
        },
        this.userGamePointsRepository,
      );
    }

    // Creditar pontos aos times responsáveis
    const teamIds = kaizen.responsibles?.teams || [];
    for (const teamId of teamIds) {
      await creditTeamKaizenPoints(
        {
          teamId,
          gameId: kaizen.gameId,
          organizationId: game.organizationId,
          projectId: game.projectId,
          pointsToCredit,
        },
        this.teamGamePointsRepository,
      );
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
      await deleteKaizenComment({ commentId }, this.commentRepository);
    } catch {
      throw new NotFoundException(`Comment not found: ${commentId}`);
    }
  }
}
