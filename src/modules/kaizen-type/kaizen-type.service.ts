import {
  createKaizenType,
  CreateKaizenTypeInput,
  updateKaizenType,
  UpdateKaizenTypeInput,
  getKaizenType,
  deleteKaizenType,
  listOrganizationKaizenTypes,
  KaizenTypeEntity,
} from "@domain/kaizen-type";
import type { IKaizenTypeRepository } from "@domain/kaizen-type/repositories/kaizen-type.repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class KaizenTypeService {
  constructor(
    @Inject("IKaizenTypeRepository")
    private readonly typeRepository: IKaizenTypeRepository,
  ) {}

  async createType(input: CreateKaizenTypeInput): Promise<KaizenTypeEntity> {
    const result = await createKaizenType(input, this.typeRepository);
    return result.type;
  }

  async getType(
    organizationId: string,
    typeId: string,
  ): Promise<KaizenTypeEntity> {
    try {
      const result = await getKaizenType(
        { organizationId, typeId },
        this.typeRepository,
      );
      return result.type;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Kaizen type not found: ${typeId}`);
      }
      throw error;
    }
  }

  async updateType(input: UpdateKaizenTypeInput): Promise<KaizenTypeEntity> {
    try {
      const result = await updateKaizenType(input, this.typeRepository);
      return result.type;
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Kaizen type not found: ${input.typeId}`);
      }
      throw error;
    }
  }

  async deleteType(organizationId: string, typeId: string): Promise<void> {
    try {
      await deleteKaizenType({ organizationId, typeId }, this.typeRepository);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(`Kaizen type not found: ${typeId}`);
      }
      throw error;
    }
  }

  async listByOrganization(
    organizationId: string,
  ): Promise<KaizenTypeEntity[]> {
    const result = await listOrganizationKaizenTypes(
      { organizationId },
      this.typeRepository,
    );
    return result.types;
  }
}
