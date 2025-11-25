import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateKaizenDto } from "./dto/create-kaizen.dto";
import { KaizenResponseDto } from "./dto/kaizen-response.dto";
import { UpdateKaizenDto } from "./dto/update-kaizen.dto";
import { KaizenService } from "./kaizen.service";

@ApiTags("kaizens")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class KaizenController {
  constructor(private readonly kaizenService: KaizenService) {}

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
  async listByGame(
    @Param("gameId") gameId: string,
  ): Promise<KaizenResponseDto[]> {
    const kaizens = await this.kaizenService.listByGame(gameId);
    return kaizens.map(KaizenResponseDto.fromEntity);
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
  @ApiOperation({ summary: "Delete kaizen" })
  @ApiResponse({ status: 204 })
  async deleteKaizen(@Param("kaizenId") kaizenId: string): Promise<void> {
    await this.kaizenService.deleteKaizen(kaizenId);
  }
}
