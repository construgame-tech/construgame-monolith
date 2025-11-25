import { randomUUID } from "node:crypto";
import {
  createKaizenTypeEntity,
  KaizenTypeEntity,
  updateKaizenTypeEntity,
} from "@domain/kaizen-type/entities/kaizen-type.entity";
import type { IKaizenTypeRepository } from "@domain/kaizen-type/repositories/kaizen-type.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

export interface CreateKaizenTypeInput {
  organizationId: string;
  name: string;
  description?: string;
  points: number;
  ideaPoints?: number;
  ideaExecutionPoints?: number;
}

export interface UpdateKaizenTypeInput {
  organizationId: string;
  typeId: string;
  name?: string;
  description?: string;
  points?: number;
  ideaPoints?: number;
  ideaExecutionPoints?: number;
}

@Injectable()
export class KaizenTypeService {
  constructor(
    @Inject("IKaizenTypeRepository")
    private readonly typeRepository: IKaizenTypeRepository,
  ) {}

  async createType(input: CreateKaizenTypeInput): Promise<KaizenTypeEntity> {
    const type = createKaizenTypeEntity({
      id: randomUUID(),
      organizationId: input.organizationId,
      name: input.name,
      description: input.description,
      points: input.points,
      ideaPoints: input.ideaPoints,
      ideaExecutionPoints: input.ideaExecutionPoints,
    });

    await this.typeRepository.save(type);
    return type;
  }

  async getType(
    organizationId: string,
    typeId: string,
  ): Promise<KaizenTypeEntity> {
    const type = await this.typeRepository.findById(organizationId, typeId);

    if (!type) {
      throw new NotFoundException(`Kaizen type not found: ${typeId}`);
    }

    return type;
  }

  async updateType(input: UpdateKaizenTypeInput): Promise<KaizenTypeEntity> {
    const currentType = await this.typeRepository.findById(
      input.organizationId,
      input.typeId,
    );

    if (!currentType) {
      throw new NotFoundException(`Kaizen type not found: ${input.typeId}`);
    }

    const updatedType = updateKaizenTypeEntity(currentType, {
      name: input.name,
      description: input.description,
      points: input.points,
      ideaPoints: input.ideaPoints,
      ideaExecutionPoints: input.ideaExecutionPoints,
    });

    await this.typeRepository.save(updatedType);
    return updatedType;
  }

  async deleteType(organizationId: string, typeId: string): Promise<void> {
    const type = await this.typeRepository.findById(organizationId, typeId);
    if (!type) {
      throw new NotFoundException(`Kaizen type not found: ${typeId}`);
    }
    await this.typeRepository.delete(organizationId, typeId);
  }

  async listByOrganization(
    organizationId: string,
  ): Promise<KaizenTypeEntity[]> {
    return this.typeRepository.findByOrganizationId(organizationId);
  }
}
