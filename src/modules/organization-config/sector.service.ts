import {
  createSector,
  updateSector,
  deleteSector,
  listSectors,
} from "@domain/organization-config";
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
    const { sector } = await createSector(
      { organizationId, name: dto.name },
      this.repository,
    );
    return sector;
  }

  async findAll(organizationId: string) {
    const { sectors } = await listSectors(
      { organizationId },
      this.repository,
    );
    return sectors;
  }

  async findById(organizationId: string, sectorId: string) {
    const sector = await this.repository.findById(organizationId, sectorId);
    if (!sector) {
      throw new NotFoundException("Sector not found");
    }
    return sector;
  }

  async update(organizationId: string, sectorId: string, dto: UpdateSectorDto) {
    try {
      const { sector } = await updateSector(
        { organizationId, sectorId, name: dto.name },
        this.repository,
      );
      return sector;
    } catch {
      throw new NotFoundException("Sector not found");
    }
  }

  async delete(organizationId: string, sectorId: string) {
    try {
      await deleteSector(
        { organizationId, sectorId },
        this.repository,
      );
    } catch {
      throw new NotFoundException("Sector not found");
    }
  }
}
