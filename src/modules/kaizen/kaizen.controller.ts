import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
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
import { KaizenResponseDto } from "./dto/kaizen-response.dto";
import { ReplicateKaizenDto } from "./dto/replicate-kaizen.dto";
import { UpdateKaizenDto } from "./dto/update-kaizen.dto";
import { KaizenService } from "./kaizen.service";

@ApiTags("kaizens")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class KaizenController {
  constructor(
    @Inject(KaizenService)
    private readonly kaizenService: KaizenService,
  ) {}

  @Post("organizations/:organizationId/projects/:projectId/kaizens")
  @ApiOperation({ summary: "Create a new kaizen" })
  @ApiResponse({ status: 201, type: KaizenResponseDto })
  async createKaizen(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Body() dto: CreateKaizenDto,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.createKaizen({
      ...dto,
      organizationId,
      projectId,
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

  @Get("kaizens/:kaizenId")
  @ApiOperation({ summary: "Get kaizen by ID" })
  @ApiResponse({ status: 200, type: KaizenResponseDto })
  async getKaizen(
    @Param("kaizenId") kaizenId: string,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.getKaizen(kaizenId);
    return KaizenResponseDto.fromEntity(kaizen);
  }

  @Get("games/:gameId/kaizens")
  @ApiOperation({ summary: "List kaizens by game" })
  @ApiResponse({ status: 200, type: [KaizenResponseDto] })
  async listByGame(@Param("gameId") gameId: string) {
    const kaizens = await this.kaizenService.listByGame(gameId);
    return {
      items: kaizens.map(KaizenResponseDto.fromEntity),
    };
  }

  @Get("organizations/:organizationId/projects/:projectId/kaizens")
  @ApiOperation({ summary: "List kaizens by project" })
  @ApiResponse({ status: 200, type: [KaizenResponseDto] })
  async listByProject(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
  ): Promise<KaizenResponseDto[]> {
    const kaizens = await this.kaizenService.listByProject(
      organizationId,
      projectId,
    );
    return kaizens.map(KaizenResponseDto.fromEntity);
  }

  @Get("organizations/:organizationId/kaizens")
  @ApiOperation({ summary: "List all kaizens of an organization" })
  @ApiResponse({ status: 200, type: [KaizenResponseDto] })
  async listByOrganization(
    @Param("organizationId") organizationId: string,
  ): Promise<KaizenResponseDto[]> {
    const kaizens = await this.kaizenService.listByOrganization(organizationId);
    return kaizens.map(KaizenResponseDto.fromEntity);
  }

  @Put("kaizens/:kaizenId")
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

  @Delete("kaizens/:kaizenId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete kaizen" })
  @ApiResponse({ status: 204 })
  async deleteKaizen(@Param("kaizenId") kaizenId: string): Promise<void> {
    await this.kaizenService.deleteKaizen(kaizenId);
  }

  // Rotas adicionais do openapi.yaml

  @Get("organizations/:organizationId/kaizens/count")
  @ApiOperation({ summary: "Count organization kaizens" })
  @ApiParam({ name: "organizationId", type: String })
  @ApiResponse({ status: 200, description: "Kaizen count" })
  async countByOrganization(
    @Param("organizationId") organizationId: string,
  ): Promise<{ count: number }> {
    const count = await this.kaizenService.countByOrganization(organizationId);
    return { count };
  }

  @Post("games/:gameId/kaizens")
  @ApiOperation({ summary: "Create kaizen for a game" })
  @ApiParam({ name: "gameId", type: String })
  @ApiResponse({ status: 201, type: KaizenResponseDto })
  async createKaizenForGame(
    @Param("gameId") gameId: string,
    @Query("organizationId") organizationId: string,
    @Query("projectId") projectId: string,
    @Body() dto: CreateKaizenDto,
  ): Promise<KaizenResponseDto> {
    const kaizen = await this.kaizenService.createKaizen({
      ...dto,
      organizationId,
      projectId,
      gameId,
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

  @Post("games/:gameId/kaizens/replicate")
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

  @Get("games/:gameId/kaizens/:kaizenId")
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

  @Put("games/:gameId/kaizens/:kaizenId")
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

  @Delete("games/:gameId/kaizens/:kaizenId")
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

  @Put("games/:gameId/kaizens/:kaizenId/complete")
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

  @Put("games/:gameId/kaizens/:kaizenId/reopen")
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

  @Put("games/:gameId/kaizens/:kaizenId/archive")
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

  @Put("games/:gameId/kaizens/:kaizenId/unarchive")
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
}
