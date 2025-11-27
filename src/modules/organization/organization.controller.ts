import {
  createOrganization,
  deleteOrganization,
  getOrganization,
  listOrganizations,
  updateOrganization,
} from "@domain/organization";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
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
import type { CreateOrganizationDto } from "./dto/create-organization.dto";
import { OrganizationResponseDto } from "./dto/organization-response.dto";
import type { UpdateOrganizationDto } from "./dto/update-organization.dto";

@ApiTags("organization")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("organization")
export class OrganizationController {
  constructor(
    @Inject(OrganizationRepository)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new organization" })
  @ApiResponse({ status: 201, type: OrganizationResponseDto })
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    try {
      const result = await createOrganization(
        createOrganizationDto,
        this.organizationRepository,
      );
      return OrganizationResponseDto.fromEntity(result.organization);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(":organizationId")
  @ApiOperation({ summary: "Get organization by ID" })
  @ApiParam({
    name: "organizationId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  @ApiResponse({ status: 404, description: "Organization not found" })
  async findOne(
    @Param("organizationId") organizationId: string,
  ): Promise<OrganizationResponseDto> {
    try {
      const result = await getOrganization(
        { organizationId },
        this.organizationRepository,
      );
      return OrganizationResponseDto.fromEntity(result.organization);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: "List all organizations" })
  @ApiResponse({ status: 200, type: [OrganizationResponseDto] })
  async findAll() {
    try {
      const result = await listOrganizations({}, this.organizationRepository);
      return {
        items: result.organizations.map((org) =>
          OrganizationResponseDto.fromEntity(org),
        ),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(":organizationId")
  @ApiOperation({ summary: "Update organization" })
  @ApiParam({
    name: "organizationId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  async update(
    @Param("organizationId") organizationId: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    try {
      const result = await updateOrganization(
        { organizationId, ...updateOrganizationDto },
        this.organizationRepository,
      );
      return OrganizationResponseDto.fromEntity(result.organization);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(":organizationId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete organization" })
  @ApiParam({
    name: "organizationId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 204, description: "Organization deleted" })
  async remove(@Param("organizationId") organizationId: string): Promise<void> {
    try {
      await deleteOrganization({ organizationId }, this.organizationRepository);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
