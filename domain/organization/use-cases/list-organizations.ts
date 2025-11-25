// Use Case: Listar todas as organizations

import type { OrganizationEntity } from "../entities/organization.entity";
import type { IOrganizationRepository } from "../repositories/organization.repository.interface";

export type ListOrganizationsInput = {};

export interface ListOrganizationsOutput {
  organizations: OrganizationEntity[];
}

export const listOrganizations = async (
  input: ListOrganizationsInput,
  organizationRepository: IOrganizationRepository,
): Promise<ListOrganizationsOutput> => {
  // Busca todas as organizations
  const organizations = await organizationRepository.findAll();

  return { organizations };
};
