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
import type { IKaizenIdeaRepository } from "@domain/kaizen-idea/repositories/kaizen-idea.repository.interface";
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
    @Inject("IKaizenIdeaRepository")
    private readonly kaizenIdeaRepository: IKaizenIdeaRepository,
    @Inject("UserGamePointsRepository")
    private readonly userGamePointsRepository: UserGamePointsRepository,
    @Inject("TeamGamePointsRepository")
    private readonly teamGamePointsRepository: TeamGamePointsRepository,
    @Inject("IGameRepository")
    private readonly gameRepository: IGameRepository,
  ) {}

  async createKaizen(input: CreateKaizenInput): Promise<KaizenEntity> {
    // Se não tiver kaizenTypeId, buscar automaticamente o tipo de menor pontuação
    let kaizenTypeId = input.kaizenTypeId;
    if (!kaizenTypeId) {
      const lowestType = await this.kaizenTypeRepository.findLowestPointsType(
        input.organizationId,
      );
      if (lowestType) {
        kaizenTypeId = lowestType.id;
      }
    }

    const result = await createKaizen(
      { ...input, kaizenTypeId },
      this.kaizenRepository,
    );
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
   * - Se o kaizen veio de uma ideia, os autores da ideia recebem ideaExecutionPoints
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

    // Se o kaizen veio de uma ideia, creditar ideaExecutionPoints aos autores
    if (kaizen.kaizenIdeaId && kaizenType.ideaExecutionPoints) {
      await this.creditIdeaExecutionPoints(
        kaizen.kaizenIdeaId,
        kaizenType.ideaExecutionPoints,
        game.organizationId,
        game.projectId,
        kaizen.gameId,
      );
    }
  }

  /**
   * Credita pontos de execução de ideia aos autores da ideia original.
   *
   * Regra de negócio:
   * - Quando um kaizen baseado em uma ideia é aprovado, os autores da ideia recebem bônus
   * - O bônus é definido em kaizenType.ideaExecutionPoints
   */
  private async creditIdeaExecutionPoints(
    kaizenIdeaId: string,
    ideaExecutionPoints: number,
    organizationId: string,
    projectId: string,
    gameId: string,
  ): Promise<void> {
    const idea = await this.kaizenIdeaRepository.findByIdOnly(kaizenIdeaId);
    if (!idea || !idea.authors) {
      return;
    }

    // Creditar pontos aos players autores da ideia
    const authorPlayers = idea.authors.players || [];
    for (const userId of authorPlayers) {
      await creditUserKaizenPoints(
        {
          userId,
          gameId,
          organizationId,
          projectId,
          pointsToCredit: ideaExecutionPoints,
        },
        this.userGamePointsRepository,
      );
    }

    // Creditar pontos aos times autores da ideia
    const authorTeams = idea.authors.teams || [];
    for (const teamId of authorTeams) {
      await creditTeamKaizenPoints(
        {
          teamId,
          gameId,
          organizationId,
          projectId,
          pointsToCredit: ideaExecutionPoints,
        },
        this.teamGamePointsRepository,
      );
    }
  }

  /**
   * Remove pontos de kaizen quando o kaizen é reaberto.
   *
   * Regra de negócio:
   * - Quando um kaizen é reaberto, os pontos creditados devem ser removidos
   * - Remove pontos dos responsáveis (players e teams)
   * - Remove pontos de ideaExecutionPoints dos autores se aplicável
   */
  private async removeKaizenPoints(kaizen: KaizenEntity): Promise<void> {
    if (!kaizen.kaizenTypeId) {
      return;
    }

    const kaizenType = await this.kaizenTypeRepository.findById(
      kaizen.organizationId,
      kaizen.kaizenTypeId,
    );

    if (!kaizenType || kaizenType.points <= 0) {
      return;
    }

    const game = await this.gameRepository.findByIdOnly(kaizen.gameId);
    if (!game) {
      return;
    }

    const pointsToRemove = -kaizenType.points; // Negativo para remover

    // Remover pontos dos players responsáveis
    const playerIds = kaizen.responsibles?.players || [];
    for (const userId of playerIds) {
      await creditUserKaizenPoints(
        {
          userId,
          gameId: kaizen.gameId,
          organizationId: game.organizationId,
          projectId: game.projectId,
          pointsToCredit: pointsToRemove,
        },
        this.userGamePointsRepository,
      );
    }

    // Remover pontos dos times responsáveis
    const teamIds = kaizen.responsibles?.teams || [];
    for (const teamId of teamIds) {
      await creditTeamKaizenPoints(
        {
          teamId,
          gameId: kaizen.gameId,
          organizationId: game.organizationId,
          projectId: game.projectId,
          pointsToCredit: pointsToRemove,
        },
        this.teamGamePointsRepository,
      );
    }

    // Se veio de uma ideia, remover ideaExecutionPoints dos autores
    if (kaizen.kaizenIdeaId && kaizenType.ideaExecutionPoints) {
      await this.creditIdeaExecutionPoints(
        kaizen.kaizenIdeaId,
        -kaizenType.ideaExecutionPoints, // Negativo para remover
        game.organizationId,
        game.projectId,
        kaizen.gameId,
      );
    }
  }

  async reopen(kaizenId: string): Promise<KaizenEntity> {
    try {
      // Buscar kaizen antes de reabrir para verificar se estava aprovado
      const currentKaizen = await this.kaizenRepository.findById(kaizenId);
      if (!currentKaizen) {
        throw new Error("Kaizen not found");
      }

      const wasApproved = currentKaizen.status === "APPROVED";

      const result = await reopenKaizen({ kaizenId }, this.kaizenRepository);

      // Se o kaizen estava aprovado, remover os pontos creditados
      if (wasApproved) {
        await this.removeKaizenPoints(currentKaizen);
      }

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
