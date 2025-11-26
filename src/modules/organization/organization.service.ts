import {
  createOrganization,
  deleteOrganization,
  getOrganization,
  listOrganizations,
  updateOrganization,
} from "@domain/organization";
import type { OrganizationEntity } from "@domain/organization/entities/organization.entity";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateOrganizationDto } from "./dto/create-organization.dto";
import type { UpdateOrganizationDto } from "./dto/update-organization.dto";

@Injectable()
export class OrganizationService {
  constructor(
    @Inject(OrganizationRepository)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async create(
    dto: CreateOrganizationDto,
  ): Promise<{ organization: OrganizationEntity }> {
    return createOrganization(dto, this.organizationRepository);
  }

  async findById(id: string): Promise<OrganizationEntity> {
    try {
      const result = await getOrganization(
        { organizationId: id },
        this.organizationRepository,
      );
      return result.organization;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Organization not found: ${id}`);
      }
      throw error;
    }
  }

  async findAll(): Promise<OrganizationEntity[]> {
    const result = await listOrganizations({}, this.organizationRepository);
    return result.organizations;
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    try {
      const result = await updateOrganization(
        { organizationId: id, ...dto },
        this.organizationRepository,
      );
      return result.organization;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Organization not found: ${id}`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await deleteOrganization(
        { organizationId: id },
        this.organizationRepository,
      );
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Organization not found: ${id}`);
      }
      throw error;
    }
  }
}
