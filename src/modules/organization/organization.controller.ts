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
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { CreateOrganizationDto } from "./dto/create-organization.dto";
import { OrganizationResponseDto } from "./dto/organization-response.dto";
import type { UpdateOrganizationDto } from "./dto/update-organization.dto";

@ApiTags("organizations")
@ApiBearerAuth("JWT-auth")
@Controller("organizations")
export class OrganizationController {
  constructor(
    @Inject(OrganizationRepository)
    private readonly organizationRepository: OrganizationRepository,
  ) {
    console.log(
      "OrganizationController constructed with repo:",
      !!this.organizationRepository,
      "instance:",
      (this.organizationRepository as any)?.instanceId,
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new organization" })
  @ApiResponse({ status: 201, type: OrganizationResponseDto })
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    console.log(
      "Controller.create called with repo:",
      !!this.organizationRepository,
    );
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

  @Get(":id")
  @ApiOperation({ summary: "Get organization by ID" })
  @ApiParam({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  @ApiResponse({ status: 404, description: "Organization not found" })
  async findOne(@Param("id") id: string): Promise<OrganizationResponseDto> {
    try {
      const result = await getOrganization(
        { organizationId: id },
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
  async findAll(): Promise<OrganizationResponseDto[]> {
    try {
      const result = await listOrganizations({}, this.organizationRepository);
      return result.organizations.map((org) =>
        OrganizationResponseDto.fromEntity(org),
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(":id")
  @ApiOperation({ summary: "Update organization" })
  @ApiParam({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  async update(
    @Param("id") id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    try {
      const result = await updateOrganization(
        { organizationId: id, ...updateOrganizationDto },
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

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete organization" })
  @ApiParam({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 204, description: "Organization deleted" })
  async remove(@Param("id") id: string): Promise<void> {
    try {
      await deleteOrganization(
        { organizationId: id },
        this.organizationRepository,
      );
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
