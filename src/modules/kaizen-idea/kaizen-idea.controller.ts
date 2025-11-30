import { OrganizationAccessGuard } from "@common/guards";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateKaizenIdeaDto } from "./dto/create-kaizen-idea.dto";
import { KaizenIdeaResponseDto } from "./dto/kaizen-idea-response.dto";
import { UpdateKaizenIdeaDto } from "./dto/update-kaizen-idea.dto";
import { KaizenIdeaService } from "./kaizen-idea.service";

@ApiTags("kaizen-ideas")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
@Controller()
export class KaizenIdeaController {
  constructor(
    @Inject(KaizenIdeaService) private readonly ideaService: KaizenIdeaService,
  ) {}

  // ========== New Routes (/organization/:organizationId/kaizen/idea) ==========

  @Post("organization/:organizationId/kaizen/idea")
  @ApiOperation({ summary: "Create a new kaizen idea" })
  @ApiResponse({ status: 201, type: KaizenIdeaResponseDto })
  async createIdeaNew(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateKaizenIdeaDto,
  ): Promise<KaizenIdeaResponseDto> {
    const idea = await this.ideaService.createIdea({
      ...dto,
      organizationId,
    });
    return KaizenIdeaResponseDto.fromEntity(idea);
  }

  @Get("organization/:organizationId/kaizen/idea/:kaizenIdeaId")
  @ApiOperation({ summary: "Get kaizen idea by ID" })
  @ApiResponse({ status: 200, type: KaizenIdeaResponseDto })
  async getIdeaById(
    @Param("organizationId") organizationId: string,
    @Param("kaizenIdeaId") ideaId: string,
  ): Promise<KaizenIdeaResponseDto> {
    const idea = await this.ideaService.getIdea(organizationId, ideaId);
    return KaizenIdeaResponseDto.fromEntity(idea);
  }

  @Get("organization/:organizationId/kaizen/idea/search")
  @ApiOperation({ summary: "Search kaizen ideas" })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["DRAFT", "APPROVED", "ARCHIVED"],
  })
  @ApiQuery({ name: "isRecommended", required: false, type: Boolean })
  @ApiQuery({ name: "isPlayer", required: false, type: Boolean })
  @ApiQuery({ name: "kaizenTypeId", required: false, type: String })
  @ApiQuery({ name: "gameIds", required: false, type: [String] })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiResponse({ status: 200, type: [KaizenIdeaResponseDto] })
  async searchIdeas(
    @Param("organizationId") organizationId: string,
    @Query("search") _search?: string,
    @Query("status") _status?: string,
    @Query("isRecommended") _isRecommended?: boolean,
    @Query("isPlayer") _isPlayer?: boolean,
    @Query("kaizenTypeId") _kaizenTypeId?: string,
    @Query("gameIds") _gameIds?: string[],
    @Query("limit") _limit?: number,
    @Query("page") _page?: number,
  ) {
    // Busca simplificada - retorna todas as ideias da organização
    // TODO: implementar filtros avançados
    const ideas = await this.ideaService.listByOrganization(organizationId);
    return {
      items: ideas.map(KaizenIdeaResponseDto.fromEntity),
    };
  }

  @Patch("organization/:organizationId/kaizen/idea/:kaizenIdeaId")
  @ApiOperation({ summary: "Update kaizen idea" })
  @ApiResponse({ status: 200, type: KaizenIdeaResponseDto })
  async updateIdeaNew(
    @Param("organizationId") organizationId: string,
    @Param("kaizenIdeaId") ideaId: string,
    @Body() dto: UpdateKaizenIdeaDto,
  ): Promise<KaizenIdeaResponseDto> {
    const idea = await this.ideaService.updateIdea({
      organizationId,
      ideaId,
      ...dto,
    });
    return KaizenIdeaResponseDto.fromEntity(idea);
  }

  @Put("organization/:organizationId/kaizen/idea/:kaizenIdeaId")
  @ApiOperation({ summary: "Update kaizen idea (PUT alias)" })
  @ApiResponse({ status: 200, type: KaizenIdeaResponseDto })
  async updateIdeaNewPut(
    @Param("organizationId") organizationId: string,
    @Param("kaizenIdeaId") ideaId: string,
    @Body() dto: UpdateKaizenIdeaDto,
  ): Promise<KaizenIdeaResponseDto> {
    const idea = await this.ideaService.updateIdea({
      organizationId,
      ideaId,
      ...dto,
    });
    return KaizenIdeaResponseDto.fromEntity(idea);
  }

  @Delete("organization/:organizationId/kaizen/idea/:kaizenIdeaId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete kaizen idea" })
  @ApiResponse({ status: 204 })
  async deleteIdeaNew(
    @Param("organizationId") organizationId: string,
    @Param("kaizenIdeaId") ideaId: string,
  ): Promise<void> {
    await this.ideaService.deleteIdea(organizationId, ideaId);
  }

  // ========== Legacy Routes (keep for backwards compatibility) ==========

  @Post("organization/:organizationId/kaizen-idea")
  @ApiOperation({ summary: "Create a new kaizen idea" })
  @ApiResponse({ status: 201, type: KaizenIdeaResponseDto })
  async createIdea(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateKaizenIdeaDto,
  ): Promise<KaizenIdeaResponseDto> {
    const idea = await this.ideaService.createIdea({
      ...dto,
      organizationId,
    });
    return KaizenIdeaResponseDto.fromEntity(idea);
  }

  @Get("organization/:organizationId/kaizen-idea/:ideaId")
  @ApiOperation({ summary: "Get kaizen idea by ID" })
  @ApiResponse({ status: 200, type: KaizenIdeaResponseDto })
  async getIdea(
    @Param("organizationId") organizationId: string,
    @Param("ideaId") ideaId: string,
  ): Promise<KaizenIdeaResponseDto> {
    const idea = await this.ideaService.getIdea(organizationId, ideaId);
    return KaizenIdeaResponseDto.fromEntity(idea);
  }

  @Get("organization/:organizationId/kaizen-idea")
  @ApiOperation({ summary: "List all kaizen ideas of an organization" })
  @ApiResponse({ status: 200 })
  async listIdeas(
    @Param("organizationId") organizationId: string,
  ): Promise<{ items: KaizenIdeaResponseDto[] }> {
    const ideas = await this.ideaService.listByOrganization(organizationId);
    return { items: ideas.map(KaizenIdeaResponseDto.fromEntity) };
  }

  @Patch("organization/:organizationId/kaizen-idea/:ideaId")
  @ApiOperation({ summary: "Update kaizen idea" })
  @ApiResponse({ status: 200, type: KaizenIdeaResponseDto })
  async updateIdea(
    @Param("organizationId") organizationId: string,
    @Param("ideaId") ideaId: string,
    @Body() dto: UpdateKaizenIdeaDto,
  ): Promise<KaizenIdeaResponseDto> {
    const idea = await this.ideaService.updateIdea({
      organizationId,
      ideaId,
      ...dto,
    });
    return KaizenIdeaResponseDto.fromEntity(idea);
  }

  @Delete("organization/:organizationId/kaizen-idea/:ideaId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete kaizen idea" })
  @ApiResponse({ status: 204 })
  async deleteIdea(
    @Param("organizationId") organizationId: string,
    @Param("ideaId") ideaId: string,
  ): Promise<void> {
    await this.ideaService.deleteIdea(organizationId, ideaId);
  }
}
