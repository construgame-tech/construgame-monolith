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
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectResponseDto } from "./dto/project-response.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectService } from "./project.service";

@ApiTags("projects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/project")
export class ProjectController {
  constructor(
    @Inject(ProjectService)
    private readonly projectService: ProjectService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new project" })
  @ApiResponse({ status: 201, type: ProjectResponseDto })
  async createProject(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectService.createProject({
      ...dto,
      organizationId,
    });
    return ProjectResponseDto.fromEntity(project);
  }

  @Get(":projectId")
  @ApiOperation({ summary: "Get project by ID" })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  async getProject(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectService.getProject(
      organizationId,
      projectId,
    );
    return ProjectResponseDto.fromEntity(project);
  }

  @Get()
  @ApiOperation({ summary: "List all projects of an organization" })
  @ApiResponse({ status: 200, type: [ProjectResponseDto] })
  async listProjects(
    @Param("organizationId") organizationId: string,
  ): Promise<ProjectResponseDto[]> {
    const projects =
      await this.projectService.listOrganizationProjects(organizationId);
    return projects.map(ProjectResponseDto.fromEntity);
  }

  @Patch(":projectId")
  @ApiOperation({ summary: "Update project" })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  async updateProject(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectService.updateProject({
      organizationId,
      projectId,
      ...dto,
    });
    return ProjectResponseDto.fromEntity(project);
  }

  @Delete(":projectId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete project" })
  @ApiResponse({ status: 204 })
  async deleteProject(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
  ): Promise<void> {
    await this.projectService.deleteProject(organizationId, projectId);
  }
}
