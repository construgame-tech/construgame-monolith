import {
  createOrgConfigEntity,
  updateOrgConfigEntity,
} from "@domain/organization-config/entities/org-config.entity";
import type { IOrgConfigRepository } from "@domain/organization-config/repositories/org-config.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateOrgConfigDto } from "./dto/create-org-config.dto";
import type { UpdateOrgConfigDto } from "./dto/update-org-config.dto";

@Injectable()
export class OrgConfigService {
  constructor(
    @Inject("IOrgConfigRepository")
    private readonly repository: IOrgConfigRepository,
  ) {}

  async create(organizationId: string, dto: CreateOrgConfigDto) {
    const config = createOrgConfigEntity({
      organizationId,
      missionsEnabled: dto.missionsEnabled,
      financialEnabled: dto.financialEnabled,
      kaizensEnabled: dto.kaizensEnabled,
      projectDiaryEnabled: dto.projectDiaryEnabled,
      missionConfig: dto.missionConfig,
      theme: dto.theme,
      auth: dto.auth,
    });

    await this.repository.save(config);
    return config;
  }

  async findByOrganization(organizationId: string) {
    const config = await this.repository.findByOrganizationId(organizationId);
    if (!config) {
      throw new NotFoundException("Organization config not found");
    }
    return config;
  }

  async update(organizationId: string, dto: UpdateOrgConfigDto) {
    const current = await this.findByOrganization(organizationId);
    const updated = updateOrgConfigEntity(current, dto);
    await this.repository.save(updated);
    return updated;
  }
}
