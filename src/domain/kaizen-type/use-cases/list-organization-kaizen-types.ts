// Use Case: Listar Kaizen Types de uma organização
import type { KaizenTypeEntity } from "../entities/kaizen-type.entity";
import type { IKaizenTypeRepository } from "../repositories/kaizen-type.repository.interface";

export interface ListOrganizationKaizenTypesInput {
  organizationId: string;
}

export interface ListOrganizationKaizenTypesOutput {
  types: KaizenTypeEntity[];
}

export const listOrganizationKaizenTypes = async (
  input: ListOrganizationKaizenTypesInput,
  repository: IKaizenTypeRepository,
): Promise<ListOrganizationKaizenTypesOutput> => {
  const types = await repository.findByOrganizationId(input.organizationId);

  return { types };
};
