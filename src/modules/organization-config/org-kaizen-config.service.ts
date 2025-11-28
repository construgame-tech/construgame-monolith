import type { IOrgKaizenConfigRepository } from "@domain/organization-config/repositories/org-kaizen-config.repository.interface";
import {
  createOrgKaizenConfig,
  updateOrgKaizenConfig,
} from "@domain/organization-config";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateOrgKaizenConfigDto } from "./dto/create-org-kaizen-config.dto";
import type { UpdateOrgKaizenConfigDto } from "./dto/update-org-kaizen-config.dto";

@Injectable()
export class OrgKaizenConfigService {
  constructor(
    @Inject("IOrgKaizenConfigRepository")
    private readonly repository: IOrgKaizenConfigRepository,
  ) {}

  async create(organizationId: string, dto: CreateOrgKaizenConfigDto) {
    const { config } = await createOrgKaizenConfig(
      {
        organizationId,
        categoryPoints: dto.categoryPoints,
      },
      this.repository,
    );

    return config;
  }

  async findByOrganization(organizationId: string) {
    const config = await this.repository.findByOrganizationId(organizationId);
    if (!config) {
      throw new NotFoundException("Kaizen config not found");
    }
    return config;
  }

  async update(organizationId: string, dto: UpdateOrgKaizenConfigDto) {
    const { config } = await updateOrgKaizenConfig(
      {
        organizationId,
        categoryPoints: dto.categoryPoints,
      },
      this.repository,
    );

    return config;
  }
}
