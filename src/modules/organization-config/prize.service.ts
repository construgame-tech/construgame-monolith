import { randomUUID } from "node:crypto";
import {
  createPrizeEntity,
  updatePrizeEntity,
} from "@domain/organization-config/entities/prize.entity";
import type { IPrizeRepository } from "@domain/organization-config/repositories/prize.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CreatePrizeDto } from "./dto/create-prize.dto";
import type { UpdatePrizeDto } from "./dto/update-prize.dto";

@Injectable()
export class PrizeService {
  constructor(
    @Inject("IPrizeRepository")
    private readonly repository: IPrizeRepository,
  ) {}

  async create(organizationId: string, dto: CreatePrizeDto) {
    const prize = createPrizeEntity({
      id: randomUUID(),
      organizationId,
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      photo: dto.photo,
    });

    await this.repository.save(prize);
    return prize;
  }

  async findAll(organizationId: string) {
    return this.repository.findByOrganizationId(organizationId);
  }

  async findById(organizationId: string, prizeId: string) {
    const prize = await this.repository.findById(organizationId, prizeId);
    if (!prize) {
      throw new NotFoundException("Prize not found");
    }
    return prize;
  }

  async update(organizationId: string, prizeId: string, dto: UpdatePrizeDto) {
    const current = await this.findById(organizationId, prizeId);
    const updated = updatePrizeEntity(current, dto);
    await this.repository.save(updated);
    return updated;
  }

  async delete(organizationId: string, prizeId: string) {
    await this.findById(organizationId, prizeId);
    await this.repository.delete(organizationId, prizeId);
  }
}
