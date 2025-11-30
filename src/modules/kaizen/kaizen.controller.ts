import { OrganizationAccessGuard } from "@common/guards";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateKaizenDto } from "./dto/create-kaizen.dto";
import { CreateKaizenCommentDto } from "./dto/create-kaizen-comment.dto";
import { KaizenCommentResponseDto } from "./dto/kaizen-comment-response.dto";
import { KaizenResponseDto } from "./dto/kaizen-response.dto";
import { ReplicateKaizenDto } from "./dto/replicate-kaizen.dto";
import { UpdateKaizenDto } from "./dto/update-kaizen.dto";
import { KaizenService } from "./kaizen.service";

@ApiTags("kaizens")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
@Controller()
export class KaizenController {
  constructor(
    @Inject(KaizenService)
    private readonly kaizenService: KaizenService,
    private readonly gameRepository: GameRepository,
  ) {}

  @Post("organization/:organizationId/project/:projectId/kaizen")
  @ApiOperation({ summary: "Create a new kaizen" })
  @ApiResponse({ status: 201, type: KaizenResponseDto })
  async createKaizen(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Body() dto: CreateKaizenDto,
  ): Promise<KaizenResponseDto> {
    if (!dto.gameId) {
      throw new BadRequestException("gameId is required");
    }
    const kaizen = await this.kaizenService.createKaizen({
      ...dto,
      organizationId,
      projectId,
      gameId: dto.gameId,
      tasks: dto.tasks?.map((task) => ({
        name: task.name,
        isComplete: task.isComplete ?? false,
        responsibleId: task.responsibleId ?? "",
        endDate: task.endDate,
        budget: task.budget,
      })),
    });
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Get("kaizen/:kaizenId")
  @ApiOperation({ summary: "Get kaizen by ID" })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async getKaizen(
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.getKaizen(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Get("game/:gameId/kaizen")
  @ApiOperation({ summary: "List kaizens by game" })
  @ApiResponse({ status: 200, type: [KaizenResponseDto] })
  async listByGame(@Param("gameId") gameId: string) {
    const kaizens = await this.kaizenService.listByGame(gameId);
    return {
      items: kaizens.map(KaizenResponseDto.fromEntity),
    };
  }

  @Get("organization/:organizationId/project/:projectId/kaizen")
  @ApiOperation({ summary: "List kaizens by project" })
  @ApiResponse({ status: 200 })
  async listByProject(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
  ): Promise<{ items: KaizenResponseDto[] }> {
    const kaizens = await this.kaizenService.listByProject(
      organizationId,
      projectId,
    );
    return { items: kaizens.map(KaizenResponseDto.fromEntity) };
  }

  @Get("organization/:organizationId/kaizen")
  @ApiOperation({ summary: "List all kaizens of an organization" })
  @ApiResponse({ status: 200 })
  async listByOrganization(
    @Param("organizationId") organizationId: string,
  ): Promise<{ items: KaizenResponseDto[] }> {
    const kaizens = await this.kaizenService.listByOrganization(organizationId);
    return { items: kaizens.map(KaizenResponseDto.fromEntity) };
  }

  @Patch("kaizen/:kaizenId")
  @ApiOperation({ summary: "Update kaizen" })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async updateKaizen(
    @Param("kaizenId") kaizenId: string,
    @Body() dto: UpdateKaizenDto,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.updateKaizen({
      kaizenId,
      ...dto,
      tasks: dto.tasks?.map((task) => ({
        name: task.name,
        isComplete: task.isComplete ?? false,
        responsibleId: task.responsibleId ?? "",
        endDate: task.endDate,
        budget: task.budget,
      })),
    });
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Delete("kaizen/:kaizenId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete kaizen" })
  @ApiResponse({ status: 204 })
  async deleteKaizen(@Param("kaizenId") kaizenId: string): Promise<void> {
    await this.kaizenService.deleteKaizen(kaizenId);
  }

  // Rotas adicionais do openapi.yaml

  @Get("organization/:organizationId/kaizen/count")
  @ApiOperation({ summary: "Count organization kaizens" })
  @ApiParam({ name: "organizationId", type: String })
  @ApiResponse({ status: 200, description: "Kaizen count" })
  async countByOrganization(
    @Param("organizationId") organizationId: string,
  ): Promise<{ count: number }> {
    const count = await this.kaizenService.countByOrganization(organizationId);
    return { count };
  }

  @Post("game/:gameId/kaizen")
  @ApiOperation({ summary: "Create kaizen for a game" })
  @ApiParam({ name: "gameId", type: String })
  @ApiResponse({ status: 201, type: KaizenResponseDto })
  async createKaizenForGame(
    @Param("gameId") gameId: string,
    @Query("organizationId") queryOrganizationId: string,
    @Query("projectId") queryProjectId: string,
    @Body() dto: CreateKaizenDto,
  ): Promise<KaizenResponseDto> {
    // Busca dados do game se não foram fornecidos nos query params
    let organizationId = queryOrganizationId;
    let projectId = queryProjectId;

    if (!organizationId || !projectId) {
      const game = await this.gameRepository.findByIdOnly(gameId);
      if (!game) {
        throw new NotFoundException(`Game not found: ${gameId}`);
      }
      organizationId = organizationId || game.organizationId;
      projectId = projectId || game.projectId;
    }

    const kaizen = await this.kaizenService.createKaizen({
      ...dto,
      organizationId,
      projectId,
      gameId: gameId, // Usa o gameId do path param (sobrescreve qualquer valor do body)
      tasks: dto.tasks?.map((task) => ({
        name: task.name,
        isComplete: task.isComplete ?? false,
        responsibleId: task.responsibleId ?? "",
        endDate: task.endDate,
        budget: task.budget,
      })),
    });
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Post("game/:gameId/kaizen/replicate")
  @ApiOperation({
    summary: "Replicate kaizen",
    description:
      "Replicated kaizens that are completed give the original kaizen leader bonus points",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiResponse({ status: 201, type: KaizenResponseDto })
  async replicateKaizen(
    @Param("gameId") gameId: string,
    @Query("organizationId") organizationId: string,
    @Query("projectId") projectId: string,
    @Body() dto: ReplicateKaizenDto,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.replicate({
      ...dto,
      gameId,
      organizationId,
      projectId,
    });
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Get("game/:gameId/kaizen/:kaizenId")
  @ApiOperation({ summary: "Get kaizen by ID within a game" })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async getKaizenByGame(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.getKaizen(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Patch("game/:gameId/kaizen/:kaizenId")
  @ApiOperation({ summary: "Update kaizen within a game" })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async updateKaizenByGame(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
    @Body() dto: UpdateKaizenDto,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.updateKaizen({
      kaizenId,
      ...dto,
      tasks: dto.tasks?.map((task) => ({
        name: task.name,
        isComplete: task.isComplete ?? false,
        responsibleId: task.responsibleId ?? "",
        endDate: task.endDate,
        budget: task.budget,
      })),
    });
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Put("game/:gameId/kaizen/:kaizenId")
  @ApiOperation({ summary: "Update kaizen within a game (PUT alias)" })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async updateKaizenByGamePut(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
    @Body() dto: UpdateKaizenDto,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.updateKaizen({
      kaizenId,
      ...dto,
      tasks: dto.tasks?.map((task) => ({
        name: task.name,
        isComplete: task.isComplete ?? false,
        responsibleId: task.responsibleId ?? "",
        endDate: task.endDate,
        budget: task.budget,
      })),
    });
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Delete("game/:gameId/kaizen/:kaizenId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete kaizen within a game" })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 204 })
  async deleteKaizenByGame(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<void> {
    await this.kaizenService.deleteKaizen(kaizenId);
  }

  @Patch("game/:gameId/kaizen/:kaizenId/complete")
  @ApiOperation({
    summary: "Complete kaizen",
    description: "Mark kaizen as completed, distributing points to the leader",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async completeKaizen(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.complete(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Put("game/:gameId/kaizen/:kaizenId/complete")
  @ApiOperation({
    summary: "Complete kaizen (PUT alias)",
    description: "Mark kaizen as completed, distributing points to the leader",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async completeKaizenPut(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.complete(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Patch("game/:gameId/kaizen/:kaizenId/approve")
  @ApiOperation({
    summary: "Approve kaizen",
    description: "Approve a completed kaizen (DONE -> APPROVED)",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async approveKaizen(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.approve(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Put("game/:gameId/kaizen/:kaizenId/approve")
  @ApiOperation({
    summary: "Approve kaizen (PUT alias)",
    description: "Approve a completed kaizen (DONE -> APPROVED)",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async approveKaizenPut(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.approve(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Patch("game/:gameId/kaizen/:kaizenId/reopen")
  @ApiOperation({
    summary: "Reopen kaizen",
    description:
      "Reopen a kaizen that was completed, removing the points given previously",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async reopenKaizen(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.reopen(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Put("game/:gameId/kaizen/:kaizenId/reopen")
  @ApiOperation({
    summary: "Reopen kaizen (PUT alias)",
    description:
      "Reopen a kaizen that was completed, removing the points given previously",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async reopenKaizenPut(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.reopen(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Patch("game/:gameId/kaizen/:kaizenId/archive")
  @ApiOperation({
    summary: "Archive kaizen",
    description: "Archive an active kaizen",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async archiveKaizen(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.archive(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Put("game/:gameId/kaizen/:kaizenId/archive")
  @ApiOperation({
    summary: "Archive kaizen (PUT alias)",
    description: "Archive an active kaizen",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async archiveKaizenPut(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.archive(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Patch("game/:gameId/kaizen/:kaizenId/unarchive")
  @ApiOperation({
    summary: "Unarchive kaizen",
    description: "Unarchive an archived kaizen",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async unarchiveKaizen(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.unarchive(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Put("game/:gameId/kaizen/:kaizenId/unarchive")
  @ApiOperation({
    summary: "Unarchive kaizen (PUT alias)",
    description: "Unarchive an archived kaizen",
  })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async unarchiveKaizenPut(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.unarchive(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  // ========== Kaizen Comment Routes ==========

  @Get("game/:gameId/kaizen/:kaizenId/comment")
  @ApiOperation({ summary: "List kaizen comments" })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: [KaizenCommentResponseDto] })
  async listComments(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ) {
    const comments = await this.kaizenService.listComments(kaizenId);
    return {
      items: comments.map(KaizenCommentResponseDto.fromEntity),
    };
  }

  // Alias route with plural 'comments' for frontend compatibility
  @Get("game/:gameId/kaizen/:kaizenId/comments")
  @ApiOperation({ summary: "List kaizen comments (plural alias)" })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 200, type: [KaizenCommentResponseDto] })
  async listCommentsPlural(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
  ) {
    const comments = await this.kaizenService.listComments(kaizenId);
    return {
      items: comments.map(KaizenCommentResponseDto.fromEntity),
    };
  }

  @Post("game/:gameId/kaizen/:kaizenId/comment")
  @ApiOperation({ summary: "Create kaizen comment" })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 201, type: KaizenCommentResponseDto })
  async createComment(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
    @Body() dto: CreateKaizenCommentDto,
    @Request() req: any,
  ): Promise<KaizenCommentResponseDto> {
    const userId = req.user?.sub || req.user?.userId || "unknown";
    const comment = await this.kaizenService.createComment(
      kaizenId,
      userId,
      dto.text,
    );
    return KaizenCommentResponseDto.fromEntity(comment);
  }

  // Alias route with plural 'comments' for frontend compatibility
  @Post("game/:gameId/kaizen/:kaizenId/comments")
  @ApiOperation({ summary: "Create kaizen comment (plural alias)" })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiResponse({ status: 201, type: KaizenCommentResponseDto })
  async createCommentPlural(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") kaizenId: string,
    @Body() dto: CreateKaizenCommentDto,
    @Request() req: any,
  ): Promise<KaizenCommentResponseDto> {
    const userId = req.user?.sub || req.user?.userId || "unknown";
    const comment = await this.kaizenService.createComment(
      kaizenId,
      userId,
      dto.text,
    );
    return KaizenCommentResponseDto.fromEntity(comment);
  }

  @Delete("game/:gameId/kaizen/:kaizenId/comment/:commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete kaizen comment" })
  @ApiParam({ name: "gameId", type: String })
  @ApiParam({ name: "kaizenId", type: String })
  @ApiParam({ name: "commentId", type: String })
  @ApiResponse({ status: 204 })
  async deleteComment(
    @Param("gameId") _gameId: string,
    @Param("kaizenId") _kaizenId: string,
    @Param("commentId") commentId: string,
  ): Promise<void> {
    await this.kaizenService.deleteComment(commentId);
  }
}
