import { OrganizationAccessGuard } from "@common/guards";
import { createMemberEntity } from "@domain/member/entities/member.entity";
import {
  createOrganization,
  deleteOrganization,
  getOrganization,
  listOrganizations,
  updateOrganization,
} from "@domain/organization";
import { createOrgConfigEntity } from "@domain/organization-config/entities/org-config.entity";
import { createOrgKaizenConfigEntity } from "@domain/organization-config/entities/org-kaizen-config.entity";
import { MemberRepository } from "@infrastructure/repositories/member.repository";
import { OrgConfigRepository } from "@infrastructure/repositories/org-config.repository";
import { OrgKaizenConfigRepository } from "@infrastructure/repositories/org-kaizen-config.repository";
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
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
@Controller("organization")
export class OrganizationController {
  constructor(
    @Inject(OrganizationRepository)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrgConfigRepository)
    private readonly orgConfigRepository: OrgConfigRepository,
    @Inject(MemberRepository)
    private readonly memberRepository: MemberRepository,
    @Inject(OrgKaizenConfigRepository)
    private readonly orgKaizenConfigRepository: OrgKaizenConfigRepository,
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

      // Cria a config padrão para a organização
      const defaultConfig = createOrgConfigEntity({
        organizationId: result.organization.id,
      });
      await this.orgConfigRepository.save(defaultConfig);

      // Cria a config de kaizen padrão para a organização
      const defaultKaizenConfig = createOrgKaizenConfigEntity({
        organizationId: result.organization.id,
        categoryPoints: {
          "1": { points: 10, description: "Categoria 1" },
          "2": { points: 20, description: "Categoria 2" },
          "3": { points: 30, description: "Categoria 3" },
          "4": { points: 40, description: "Categoria 4" },
          "5": { points: 50, description: "Categoria 5" },
        },
      });
      await this.orgKaizenConfigRepository.save(defaultKaizenConfig);

      // Cria o member owner para o criador da organização
      const ownerMember = createMemberEntity({
        userId: createOrganizationDto.ownerId,
        organizationId: result.organization.id,
        role: "owner",
      });
      await this.memberRepository.save(ownerMember);

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
