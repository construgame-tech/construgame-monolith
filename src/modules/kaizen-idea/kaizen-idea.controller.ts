import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
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
@UseGuards(JwtAuthGuard)
@Controller("organizations/:organizationId/kaizen-ideas")
export class KaizenIdeaController {
  constructor(
    @Inject(KaizenIdeaService) private readonly ideaService: KaizenIdeaService,
  ) {}

  @Post()
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

  @Get(":ideaId")
  @ApiOperation({ summary: "Get kaizen idea by ID" })
  @ApiResponse({ status: 200, type: KaizenIdeaResponseDto })
  async getIdea(
    @Param("organizationId") organizationId: string,
    @Param("ideaId") ideaId: string,
  ): Promise<KaizenIdeaResponseDto> {
    const idea = await this.ideaService.getIdea(organizationId, ideaId);
    return KaizenIdeaResponseDto.fromEntity(idea);
  }

  @Get()
  @ApiOperation({ summary: "List all kaizen ideas of an organization" })
  @ApiResponse({ status: 200, type: [KaizenIdeaResponseDto] })
  async listIdeas(
    @Param("organizationId") organizationId: string,
  ): Promise<KaizenIdeaResponseDto[]> {
    const ideas = await this.ideaService.listByOrganization(organizationId);
    return ideas.map(KaizenIdeaResponseDto.fromEntity);
  }

  @Put(":ideaId")
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

  @Delete(":ideaId")
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
