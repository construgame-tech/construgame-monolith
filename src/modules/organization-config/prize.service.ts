import {
  createPrize,
  updatePrize,
  deletePrize,
  listPrizes,
} from "@domain/organization-config";
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
    const { prize } = await createPrize(
      {
        organizationId,
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        photo: dto.photo,
      },
      this.repository,
    );
    return prize;
  }

  async findAll(organizationId: string) {
    const { prizes } = await listPrizes(
      { organizationId },
      this.repository,
    );
    return prizes;
  }

  async findById(organizationId: string, prizeId: string) {
    const prize = await this.repository.findById(organizationId, prizeId);
    if (!prize) {
      throw new NotFoundException("Prize not found");
    }
    return prize;
  }

  async update(organizationId: string, prizeId: string, dto: UpdatePrizeDto) {
    try {
      const { prize } = await updatePrize(
        {
          organizationId,
          prizeId,
          name: dto.name,
          description: dto.description,
          icon: dto.icon,
          photo: dto.photo,
        },
        this.repository,
      );
      return prize;
    } catch {
      throw new NotFoundException("Prize not found");
    }
  }

  async delete(organizationId: string, prizeId: string) {
    try {
      await deletePrize(
        { organizationId, prizeId },
        this.repository,
      );
    } catch {
      throw new NotFoundException("Prize not found");
    }
  }
}
