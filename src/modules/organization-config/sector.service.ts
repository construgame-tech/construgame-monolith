import { randomUUID } from "node:crypto";
import {
  createSectorEntity,
  updateSectorEntity,
} from "@domain/organization-config/entities/sector.entity";
import type { ISectorRepository } from "@domain/organization-config/repositories/sector.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateSectorDto } from "./dto/create-sector.dto";
import type { UpdateSectorDto } from "./dto/update-sector.dto";

@Injectable()
export class SectorService {
  constructor(
    @Inject("ISectorRepository")
    private readonly repository: ISectorRepository,
  ) {}

  async create(organizationId: string, dto: CreateSectorDto) {
    const sector = createSectorEntity({
      id: randomUUID(),
      organizationId,
      name: dto.name,
    });

    await this.repository.save(sector);
    return sector;
  }

  async findAll(organizationId: string) {
    return this.repository.findByOrganizationId(organizationId);
  }

  async findById(organizationId: string, sectorId: string) {
    const sector = await this.repository.findById(organizationId, sectorId);
    if (!sector) {
      throw new NotFoundException("Sector not found");
    }
    return sector;
  }

  async update(organizationId: string, sectorId: string, dto: UpdateSectorDto) {
    const current = await this.findById(organizationId, sectorId);
    const updated = updateSectorEntity(current, dto);
    await this.repository.save(updated);
    return updated;
  }

  async delete(organizationId: string, sectorId: string) {
    await this.findById(organizationId, sectorId);
    await this.repository.delete(organizationId, sectorId);
  }
}
