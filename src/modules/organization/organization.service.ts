import {
  createOrganization,
  deleteOrganization,
  getOrganization,
  listOrganizations,
  updateOrganization,
} from "@domain/organization";
import type { OrganizationEntity } from "@domain/organization/entities/organization.entity";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { Inject, Injectable } from "@nestjs/common";
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

  async findById(id: string): Promise<OrganizationEntity | null> {
    const result = await getOrganization(
      { organizationId: id },
      this.organizationRepository,
    );
    return result.organization;
  }

  async findAll(): Promise<OrganizationEntity[]> {
    const result = await listOrganizations({}, this.organizationRepository);
    return result.organizations;
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const result = await updateOrganization(
      { organizationId: id, ...dto },
      this.organizationRepository,
    );
    return result.organization;
  }

  async remove(id: string): Promise<void> {
    await deleteOrganization(
      { organizationId: id },
      this.organizationRepository,
    );
  }
}
