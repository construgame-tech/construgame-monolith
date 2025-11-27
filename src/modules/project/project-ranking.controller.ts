import {
  Controller,
  Get,
  Inject,
  Param,
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
import { ProjectService } from "./project.service";

// DTO para ranking
class ProjectRankingItemDto {
  userId?: string;
  teamId?: string;
  gameId?: string;
  points: number;
  sector?: string;
}

class ProjectRankingResponseDto {
  ranking: ProjectRankingItemDto[];
}

@ApiTags("ranking")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProjectRankingController {
  constructor(
    @Inject(ProjectService)
    private readonly projectService: ProjectService,
  ) {}

  @Get("projects/:projectId/ranking")
  @ApiOperation({ summary: "Get project ranking" })
  @ApiQuery({
    name: "groupBy",
    required: false,
    enum: ["team", "user"],
  })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiResponse({ status: 200, type: ProjectRankingResponseDto })
  async getProjectRanking(
    @Param("projectId") _projectId: string,
    @Query("groupBy") _groupBy?: string,
    @Query("sectorId") _sectorId?: string,
  ) {
    // Stub: retorna ranking vazio por enquanto
    return {
      ranking: [],
    };
  }
}

@ApiTags("reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organizations/:organizationId/projects/:projectId")
export class ProjectReportController {
  constructor(
    @Inject(ProjectService)
    private readonly projectService: ProjectService,
  ) {}

  @Get("report")
  @ApiOperation({ summary: "Get project report (generates Excel file)" })
  @ApiResponse({
    status: 200,
    description: "The URL of the generated Excel file",
  })
  async getProjectReport(
    @Param("organizationId") _organizationId: string,
    @Param("projectId") _projectId: string,
  ) {
    // Stub: retorna URL placeholder
    return {
      reportUrl: "",
    };
  }
}
