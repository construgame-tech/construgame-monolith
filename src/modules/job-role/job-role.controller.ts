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
import { CreateJobRoleDto } from "./dto/create-job-role.dto";
import { JobRoleResponseDto } from "./dto/job-role-response.dto";
import { UpdateJobRoleDto } from "./dto/update-job-role.dto";
import { JobRoleService } from "./job-role.service";

@ApiTags("job-roles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/job-roles")
export class JobRoleController {
  constructor(
    @Inject(JobRoleService)
    private readonly jobRoleService: JobRoleService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new job role" })
  @ApiResponse({ status: 201, type: JobRoleResponseDto })
  async createJobRole(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateJobRoleDto,
  ): Promise<JobRoleResponseDto> {
    const jobRole = await this.jobRoleService.createJobRole({
      ...dto,
      organizationId,
    });
    return JobRoleResponseDto.fromEntity(jobRole);
  }

  @Get(":jobRoleId")
  @ApiOperation({ summary: "Get job role by ID" })
  @ApiResponse({ status: 200, type: JobRoleResponseDto })
  async getJobRole(
    @Param("organizationId") organizationId: string,
    @Param("jobRoleId") jobRoleId: string,
  ): Promise<JobRoleResponseDto> {
    const jobRole = await this.jobRoleService.getJobRole(
      organizationId,
      jobRoleId,
    );
    return JobRoleResponseDto.fromEntity(jobRole);
  }

  @Get()
  @ApiOperation({ summary: "List all job roles of an organization" })
  @ApiResponse({ status: 200 })
  async listJobRoles(
    @Param("organizationId") organizationId: string,
  ): Promise<{ items: JobRoleResponseDto[] }> {
    const jobRoles =
      await this.jobRoleService.listByOrganization(organizationId);
    return { items: jobRoles.map(JobRoleResponseDto.fromEntity) };
  }

  @Put(":jobRoleId")
  @ApiOperation({ summary: "Update job role" })
  @ApiResponse({ status: 200, type: JobRoleResponseDto })
  async updateJobRole(
    @Param("organizationId") organizationId: string,
    @Param("jobRoleId") jobRoleId: string,
    @Body() dto: UpdateJobRoleDto,
  ): Promise<JobRoleResponseDto> {
    const jobRole = await this.jobRoleService.updateJobRole({
      organizationId,
      jobRoleId,
      ...dto,
    });
    return JobRoleResponseDto.fromEntity(jobRole);
  }

  @Delete(":jobRoleId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete job role" })
  @ApiResponse({ status: 204 })
  async deleteJobRole(
    @Param("organizationId") organizationId: string,
    @Param("jobRoleId") jobRoleId: string,
  ): Promise<void> {
    await this.jobRoleService.deleteJobRole(organizationId, jobRoleId);
  }
}
