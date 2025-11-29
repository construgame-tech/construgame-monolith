import { KaizenTypeEntity } from "../entities/kaizen-type.entity";

export interface IKaizenTypeRepository {
  save(type: KaizenTypeEntity): Promise<void>;
  delete(organizationId: string, typeId: string): Promise<void>;
  findById(
    organizationId: string,
    typeId: string,
  ): Promise<KaizenTypeEntity | null>;
  findByOrganizationId(organizationId: string): Promise<KaizenTypeEntity[]>;
  findLowestPointsType(
    organizationId: string,
  ): Promise<KaizenTypeEntity | null>;
}
